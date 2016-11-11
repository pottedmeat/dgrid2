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
	over?: { (): V[] };
	identify?: { (item: V): string };
}

function identify(info: Scaffold<any, any, any>, item: any) {
	return (info.identify ? info.identify(item) : item['id']);
}

class Scaffolding<T> {
	infoByPath: {[key: string]: Scaffold<T, any, any>};
	ids: string[];
	parentPath: { [key: string]: Array<[ string ] | [ string, string ]> };
	viewCache: { [key: string]: View<any> };
	visitedPaths: { [key: string]: any[] }; // the ids visited in each .over
	viewsByPath: { [key: string]: { [key: string]: View<any>[] } };
	registeredViews: { [key: string]: View<any>[] };
	staleViews: { [key: string]: View<any>[] };
	childrenCache: {[key: string]: View<any>[]};
	shouldReloadParent: { (oldRender: any, newRender: any): boolean };

	constructor() {
		this.infoByPath = {};
		this.ids = [];
		this.parentPath = {};
		this.viewCache = {};
		this.visitedPaths = {};
		this.viewsByPath = {};
		this.registeredViews = {};
		this.staleViews = {};
		this.childrenCache = {};
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
	}

	private _buildCacheKey(fromPath: string, prefills: any[] = []) {
		const paths = this._parentPath(fromPath, prefills);
		const ids: string[] = [];
		for (const path of paths) {
			if (path.length === 2) {
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

	private _parentPath(fromPath: string, prefills: any[] = []) {
		const byPath = this.infoByPath;
		const paths = this._cachedParentPath(fromPath);
		let i = 0;
		for (const path of paths) {
			if (path.length === 2) {
				path[1] = identify(byPath[path[0]], prefills[i++]);
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
		delete this.childrenCache[cacheKey];
		this.reloadPath(rootContext, path, prefill, false);
	}

	reloadPath<T>(rootContext: any, id: string, prefill?: any[], full = true) {
		const pathsInfo = this.infoByPath,
			childrenCache = this.childrenCache,
			info = pathsInfo[id];
		let args = [rootContext];
		if (prefill) {
			args = args.concat(prefill);
		}

		const cacheKey = this._buildCacheKey(id, prefill);
		let children = childrenCache[cacheKey];
		if (full || !children || !children.length) {
			children = this.buildFromPath(rootContext, id, prefill, undefined, full);
			childrenCache[cacheKey] = children;
		}
		const renders = children.map(function(view) {
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
					this.reloadPath(rootContext, info.parent, prefill, false);
				}
			}
		}
	}

	// return all children of this parent in an array
	buildFromPath<T>(rootContext: T, rootPath?: string, prefill?: any[], prefilledByPaths?: any[], full = true): View<T>[] {
		let childViews: View<T>[] = [];
		prefill = (prefill || []);
		if (!prefilledByPaths || prefilledByPaths.length !== prefill.length) {
			prefilledByPaths = this._prefilledByPath(rootPath);
		}
		const ids = this.ids,
			pathsInfo = this.infoByPath,
			viewCache = this.viewCache,
			childrenCache = this.childrenCache,
			visitedPaths = this.visitedPaths,
			viewsByPath = this.viewsByPath,
			registeredViews = this.registeredViews,
			staleViews = this.staleViews;
		for (let i = 0, il = ids.length; i < il; i++) {
			const path = ids[i];
			const info = pathsInfo[path];
			let found = false;
			if (rootPath) {
				found = (info && info.parent === rootPath);
			}
			else {
				found = (!info || !info.parent);
			}
			if (found) {
				let args: any[] = [rootContext];
				if (prefill) {
					args = args.concat(prefill);
				}

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
							const identifier = identify(info, item);
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

							let children = childrenCache[cacheKey]; 
							if (full || !children || !children.length) {
								// calculate all children (with matching prefilled arguments) and append those
								children = this.buildFromPath(rootContext, path, tempPrefill, tempPrefilledByPaths);
								childrenCache[cacheKey] = children;
							}
							const renders = children.map(function(view) {
								return view.render;
							});
							if (info && info.groupChildren) {
								iargs.push(renders);
							}
							else {
								iargs = iargs.concat(renders);
							}

							const oldView = viewCache[cacheKey];
							if (oldView) {
								iargs.push(oldView);
							}

							// call the method with these arguments
							const newView: View<any> = info.callback.apply(info.context, iargs);
							if (oldView && oldView !== newView) {
								throw 'Expected view to be reused when calling ' + path;
							}
							this._cacheView(newView, cacheKey, tempPrefill, tempPrefilledByPaths);
							childViews.push(newView);
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
					let children = childrenCache[cacheKey];
					if (full || !children || !children.length) {
						children = this.buildFromPath(rootContext, path, prefill, prefilledByPaths);
						childrenCache[cacheKey] = children;
					}
					const renders = children.map(function(view) {
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
					childViews.push(newView);
				}
			}
		}

		return childViews;
	}

	build<T>(rootContext: T): View<T> {
		const childViews = this.buildFromPath<T>(rootContext);
		if (childViews.length === 1) {
			return childViews[0];
		}
		if (childViews.length === 0) {
			throw 'No parent found';
		}
		if (childViews.length === 2) {
			throw 'More than 1 parent found';
		}
	}
}

export default Scaffolding;
