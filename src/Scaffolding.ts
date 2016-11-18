
import { isColumn } from './Dgrid';
import View from './interfaces/View';

interface ObjectLiteral {
	[key: string]: any;
}

interface Scaffold<T, U extends View<any>, V> {
	id: string;
	context: any;
	callback: (<T, U extends View<any>>(context: T, view: U) => U) |
		(<T, U extends View<any>>(context: T, child: any, view: U) => U) |
		(<T, U extends View<any>>(context: T, child: any, child2: any, view: U) => U) |
		(<T, U extends View<any>>(context: T, child: any, child2: any, child3: any, view: U) => U) |
		(<T, U extends View<any>>(context: T, child: any, children: any[], view: U) => U);
	parent?: string;
	groupChildren?: boolean;
	over?: () => V[];
	identify?: (item: V) => string;
}

interface ScaffoldingArgs {
	idProperty: string;
}

interface Child<T> {
	info: Scaffold<T, any, any>;
	children: Child<T>[];
}

class Scaffolding<T> {
	infoByPath: {[key: string]: Scaffold<T, any, any>};
	idProperty: string;
	ids: string[];
	childrenPath: { [key: string]: Child<T> };
	parentPath: { [key: string]: Array<[ string ] | [ string, string ]> };
	viewCache: { [key: string]: View<any> };
	visitedPaths: { [key: string]: any[] }; // the ids visited in each .over
	viewsByPath: { [key: string]: { [key: string]: View<any>[] } };
	registeredViews: { [key: string]: View<any>[] };
	staleViews: { [key: string]: View<any>[] };
	subviewCache: {[key: string]: View<any>[]};
	shouldReloadParent: { (oldRender: any, newRender: any): boolean };

	constructor(kwArgs: ScaffoldingArgs) {
		this.idProperty = kwArgs.idProperty;
		this.infoByPath = {};
		this.ids = [];
		this.childrenPath = {};
		this.parentPath = {};
		this.viewCache = {};
		this.visitedPaths = {};
		this.viewsByPath = {};
		this.registeredViews = {};
		this.staleViews = {};
		this.subviewCache = {};
	}

	registerView (view: View<any>, identifier: string) {
		// TODO: When one of the arrays (.over) along the path
		// is removed, check to see if it's in the registered views
		// and move it from registered to stale
		let registeredViews = this.registeredViews[identifier];
		if (!registeredViews) {
			registeredViews = this.registeredViews[identifier] = [];
		}
		if (registeredViews.indexOf(view) === -1) {
			registeredViews.push(view);
		}
	}

	viewWithIdentifier (identifier: string): any {
		const staleViews = this.staleViews[identifier];
		if (staleViews && staleViews.length) {
			console.log('Reusing stale view');
			return staleViews.pop();
		}
		return null;
	}

	add(info: Scaffold<T, any, any>) {
		const id = info.id;
		this.infoByPath[id] = info;
		this.ids.push(id);

		// clear cache
		this.childrenPath = {};
		this.parentPath = {};
	}

	identify(item: any, info?: Scaffold<any, any, any>): string {
		let id: string;

		if (isColumn(item)) {
			id = item.id;
		}
		else if (info && info.identify) {
			id = info.identify(item);
		}
		else {
			id = item[this.idProperty];
		}

		return id;
	}

	private _buildCacheKey(fromPath: string, prefills: any[] = []) {
		const paths = this._parentPath(fromPath, prefills);
		const ids: string[] = [];
		for (const path of paths) {
			if (path.length === 2) {
				if (!path[1]) {
					debugger;
				}
				ids.push(path[1]);
			}
		}
		if (ids.length) {
			return ids.join(',') + ',' + fromPath;
		}
		return fromPath;
	}

	private _prefilledByPath(fromPath: string) {
		const byPath = this.infoByPath;
		const paths: string[] = [];

		let path = fromPath;
		while (true) {
			const info = byPath[path];
			if (!info) {
				break;
			}

			paths.unshift(info.id);

			path = info.parent;
			if (!path) {
				break;
			}
		}
		return paths;
	}

	private _childrenPath(fromPath: string): Child<T> {
		fromPath = (fromPath || '');
		const childrenPath = this.childrenPath;
		if (childrenPath[fromPath]) {
			return childrenPath[fromPath];
		}

		console.log('cache miss', fromPath);
		const ids = this.ids,
			pathsInfo = this.infoByPath,
			children: Child<T>[] = [];
		for (let i = 0, il = ids.length; i < il; i++) {
			const path = ids[i];
			const info = pathsInfo[path];
			if (fromPath) {
				if (info && info.parent === fromPath) {
					children.push(this._childrenPath(path));
				}
			}
			else if (!info.parent) {
				// root scaffold
				children.push(this._childrenPath(path));
				return (childrenPath[fromPath] = { info, children });
			}
		}
		return (childrenPath[fromPath] = { info: pathsInfo[fromPath], children });
	}

	private _parentPath(fromPath: string, prefills: any[] = []) {
		const byPath = this.infoByPath;
		const paths = this._cachedParentPath(fromPath);
		let i = 0;
		for (const path of paths) {
			if (path.length === 2) {
				path[1] = this.identify(prefills[i++], byPath[path[0]]);
			}
		}
		return paths;
	}

	private _cachedParentPath(fromPath: string) {
		const parentPath = this.parentPath;
		if (parentPath[fromPath]) {
			return parentPath[fromPath];
		}

		const byPath = this.infoByPath;
		const paths: Array<[ string ] | [ string, string ]> = [];

		let path = fromPath;
		while (true) {
			const info = byPath[path];
			if (!info) {
				break;
			}

			if (info.over) {
				paths.unshift([info.id, undefined]); // pull an item off the end as we move up
			}
			else {
				paths.unshift([info.id]);
			}

			path = info.parent;
			if (!path) {
				break;
			}
		}
		parentPath[fromPath] = paths;
		return paths;
	}

	private _cacheView(view: View<any>, cacheKey: string, prefill: any[], paths: string[]) {
		const viewsByPath = this.viewsByPath,
				viewCache = this.viewCache;
		if (prefill && paths) {
			for (let j = 0, jl = prefill.length; j < jl; j++) {
				const prefillId = prefill[j]['id'];
				const prefillPath = paths[j];
				let viewsById = viewsByPath[prefillPath];
				if (!viewsById) {
					viewsById = viewsByPath[prefillPath] = {};
				}
				let pathViews = viewsById[prefillId];
				if (!pathViews) {
					pathViews = viewsById[prefillId] = [];
				}
				pathViews.push(view);
			}
		}
		viewCache[cacheKey] = view;
	}

	reloadAt<T>(rootContext: T, path?: string, prefill?: any[]) {
		const cacheKey = this._buildCacheKey(path, prefill);
		delete this.subviewCache[cacheKey];
		this.reloadPath(rootContext, path, prefill, 0);
	}

	reloadPath<T>(rootContext: any, id: string, prefill?: any[], depth = Infinity) {
		const pathsInfo = this.infoByPath,
			subviewCache = this.subviewCache,
			info = pathsInfo[id];
		let args = [rootContext];
		if (prefill) {
			args = args.concat(prefill);
		}

		const cacheKey = this._buildCacheKey(id, prefill);
		let views = subviewCache[cacheKey];
		if (depth >= 0 || !views || !views.length) {
			views = this.buildFromPath(rootContext, id, prefill, undefined, depth - 1);
			subviewCache[cacheKey] = views;
		}
		const renders = views.map(function(view) {
			return view.render;
		});
		if (info && info.groupChildren) {
			args.push(renders);
		}
		else {
			args = args.concat(renders);
		}
		const oldView = this.viewCache[cacheKey];
		let oldRender: View<any>;
		if (oldView) {
			oldRender = oldView.render;
			args.push(oldView);
		}
		const newView = info.callback.apply(info.context, args);
		this._cacheView(newView, cacheKey, prefill, this._prefilledByPath(id));
		if (oldView) {
			if (oldView !== newView) {
				throw 'Expected view to be reused when calling ' + id;
			}
			if (oldRender !== newView.render) {
				if (info.parent && this.shouldReloadParent.call({}, oldView, newView)) {
					if (prefill && info.over) {
						prefill.pop();
					}
					this.reloadPath(rootContext, info.parent, prefill, -1);
				}
			}
		}
	}

	// return all subviews of this parent in an array
	buildFromPath<T>(rootContext: T, rootPath?: string, prefill?: any[], prefilledByPaths?: any[], depth = Infinity): View<T>[] {
		let subviews: View<T>[] = [];
		prefill = (prefill || []);
		if (!prefilledByPaths || prefilledByPaths.length !== prefill.length) {
			prefilledByPaths = this._prefilledByPath(rootPath);
		}
		const viewCache = this.viewCache,
			subviewCache = this.subviewCache,
			visitedPaths = this.visitedPaths,
			viewsByPath = this.viewsByPath,
			registeredViews = this.registeredViews,
			staleViews = this.staleViews,
			{ info: rootInfo, children } = this._childrenPath(rootPath);

		let args: any[] = [rootContext];
		if (prefill) {
			args = args.concat(prefill);
		}

		for (const child of children) {
			const info = child.info,
				path = info.id;

			if (info && info.over) {
				// call each child view (if any) with an element of
				// the array prefilled
				const arrCallback = info.over;
				const arr = arrCallback();
				const visiting: any[] = [];
				let visited = visitedPaths[path];
				if (!visited) {
					visited = visitedPaths[path] = [];
				}

				if (arr) {
					for (let i = 0, il = arr.length; i < il; i++) {
						// keep track of what data we've looked at
						const item = arr[i];
						const identifier = this.identify(item, info);
						const index = visited.indexOf(identifier);
						if (index !== -1) {
							visited.splice(index, 1);
						}
						visiting.push(identifier);
						// first append the item in the array and its position to the arguments
						const tempPrefill = prefill.concat(item);
						const tempPrefilledByPaths = prefilledByPaths.concat([identifier]);
						let iargs = args.concat([arr[i]]);
						// load the cache
						const cacheKey = this._buildCacheKey(path, prefill.concat([arr[i]]));
						const oldView = viewCache[cacheKey];
						if (oldView && depth < 0) {
							subviews.push(oldView);
						}
						else {
							let views = subviewCache[cacheKey];
							if (depth >= 0 || !views || !views.length) {
								// calculate all subviews (with matching prefilled arguments) and append those
								views = this.buildFromPath(rootContext, path, tempPrefill, tempPrefilledByPaths, depth - 1);
								subviewCache[cacheKey] = views;
							}
							const renders = views.map(function(view) {
								return view.render;
							});
							if (info && info.groupChildren) {
								iargs.push(renders);
							}
							else {
								iargs = iargs.concat(renders);
							}

							if (oldView) {
								iargs.push(oldView);
							}

							// call the method with these arguments
							const newView: View<any> = info.callback.apply(info.context, iargs);
							if (oldView && oldView !== newView) {
								throw 'Expected view to be reused when calling ' + path;
							}
							this._cacheView(newView, cacheKey, tempPrefill, tempPrefilledByPaths);
							subviews.push(newView);
						}
					}
				}

				for (let i = 0, il = visited.length; i < il; i++) {
					// all these views are now stale
					if (viewsByPath[path] && viewsByPath[path][visited[i]]) {
						const views = viewsByPath[path][visited[i]];
						for (const view of views) {
							for (const identifier in registeredViews) {
								const registered = registeredViews[identifier];
								const index = registered.indexOf(view);
								if (index !== -1) {
									registered.splice(index, 1);
									if (!staleViews[identifier]) {
										staleViews[identifier] = [];
									}
									staleViews[identifier].push(view);
								}
							}
						}
						views.length = 0;
					}
				}
				visited.length = 0;
				visited.push.apply(visited, visiting);
			}
			else {
				const cacheKey = this._buildCacheKey(path, prefill);
				let views = subviewCache[cacheKey];
				if (depth >= 0 || !views || !views.length) {
					views = this.buildFromPath(rootContext, path, prefill, prefilledByPaths, depth - 1);
					subviewCache[cacheKey] = views;
				}
				const renders = views.map(function(view) {
					return view.render;
				});
				if (info && info.groupChildren) {
					args.push(renders);
				}
				else {
					args = args.concat(renders);
				}

				const oldView = viewCache[cacheKey];
				if (oldView) {
					args.push(oldView);
				}

				const newView: View<any> = info.callback.apply(info.context, args);
				if (oldView && oldView !== newView) {
					throw 'Expected view to be reused when calling ' + path;
				}
				this._cacheView(newView, cacheKey, prefill, prefilledByPaths);
				subviews.push(newView);
			}
		}

		return subviews;
	}

	build<T>(rootContext: T): View<T> {
		const subviews = this.buildFromPath<T>(rootContext);
		if (subviews.length === 1) {
			return subviews[0];
		}
		if (subviews.length === 0) {
			throw 'No parent found';
		}
		if (subviews.length === 2) {
			throw 'More than 1 parent found';
		}
	}
}

export default Scaffolding;
