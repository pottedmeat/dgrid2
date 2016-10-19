import View from './interfaces/View';

interface Scaffold {
	parent?: string;
	groupChildren?: boolean;
	across?: string;
	over?: string;
}

interface ObjectLiteral {
	[key: string]: any;
}

function followPath<T>(context: any, path: string): [ObjectLiteral, any] {
	const keys = path.split('.');
	for (let i = 0, il = (keys.length - 1); i < il; i++) {
		const key = keys[i];
		if (!context[key]) {
			return null;
		}
		context = context[key];
	}
	const key = keys[keys.length - 1];
	return [context, context[key]];
}

function buildCacheKey(path: string, prefill: any[]) {
	let cacheKey = '';
	if (prefill && prefill.length) {
		// TODO: More complicated cache key
		cacheKey = prefill.map(function(value: any) {
			return value['id'];
		}).join(',') + ',';
	}
	return (cacheKey + path);
}

class Scaffolding {
	byPath: {[key: string]: Scaffold};
	byAdded: string[];
	viewCache: { [key: string]: View<any> };
	visitedPaths: { [key: string]: any[] }; // the ids visited in each .over or .across
	viewsByPath: { [key: string]: { [key: string]: View<any>[] } }; 
	registeredViews: { [key: string]: View<any>[] };
	staleViews: { [key: string]: View<any>[] };
	childrenCache: {[key: string]: View<any>[]};
	shouldReloadParent: string;

	constructor() {
		this.byPath = {};
		this.byAdded = [];
		this.viewCache = {};
		this.visitedPaths = {};
		this.viewsByPath = {};
		this.registeredViews = {};
		this.staleViews = {};
		this.childrenCache = {};
	}

	registerView (view: View<any>, identifier: string) {
		// TODO: When one of the arrays (across/over) along the path
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

	add(path: string, info?: Scaffold) {
		this.byPath[path] = info;
		this.byAdded.push(path);
	}

	reloadAt<T>(rootContext: any, path?: string, prefill?: any[]) {
		this.reloadPath(rootContext, path, prefill, false);
	}

	private _prefillPaths(fromPath: string) {
		const byPath = this.byPath;
		const paths: string[] = [];
		
		let path = fromPath;
		while (true) {
			const info = byPath[path];
			if (!info) {
				break;
			}
			const arrPath = (info.across || info.over);
			if (arrPath) {
				paths.unshift(arrPath);
			}
			path = info.parent;
			if (!path) {
				break;
			}
		}
		return paths;
	}

	private _cacheView(view: View<any>, cacheKey: string, prefill: any[], paths: any[]) {
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

	reloadPath<T>(rootContext: any, path?: string, prefill?: any[], full = true) {
		const pathsInfo = this.byPath,
			viewCache = this.viewCache,
			childrenCache = this.childrenCache,
			info = pathsInfo[path];
		let args = [rootContext];
		if (prefill) {
			args = args.concat(prefill);
		}

		const cacheKey = buildCacheKey(path, prefill);
		let children: View<any>[];
		if (full) {
			children = this.buildFromPath(rootContext, path, prefill);
		}
		else {
			children = childrenCache[cacheKey];
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
		const [context, view] = followPath(rootContext, path);
		const newView = view.apply(context, args);
		this._cacheView(newView, cacheKey, prefill, this._prefillPaths(path));
		if (oldView) {
			if (oldView !== newView) {
				throw 'Expected view to be reused when calling ' + path;
			}
			if (oldRender !== newView.render) {
				const [reloadContext, shouldRoloadParent] = followPath(rootContext, this.shouldReloadParent);
				if (info.parent && shouldRoloadParent.call(reloadContext, oldView, newView)) {
					if (prefill && (info.across || info.over)) {
						prefill.pop();
					}
					this.reloadPath(rootContext, info.parent, prefill, false);
				}
			}
		}
	}

	// return all children of this parent in an array
	buildFromPath<T>(rootContext: any, rootPath?: string, prefill?: any[], prefilledByPaths?: any[]): View<T>[] {
		let childViews: View<T>[] = [];
		const paths = this.byAdded,
			pathsInfo = this.byPath,
			viewCache = this.viewCache,
			childrenCache = this.childrenCache,
			visitedPaths = this.visitedPaths,
			viewsByPath = this.viewsByPath,
			registeredViews = this.registeredViews,
			staleViews = this.staleViews;
		for (let i = 0, il = paths.length; i < il; i++) {
			const path = paths[i];
			const info = pathsInfo[path];
			let found = false;
			if (rootPath) {
				found = (info && info.parent === rootPath);
			}
			else {
				found = (!info || !info.parent);
			}
			if (found) {
				let args = [rootContext];
				if (prefill) {
					args = args.concat(prefill);
				}

				if (info && (info.across || info.over)) {
					// call each child view (if any) with an element of
					// the array prefilled
					prefill = (prefill || []);
					prefilledByPaths = (prefilledByPaths || []);
					const arrPath = (info.across || info.over);
					const [, arr] = followPath(rootContext, arrPath);
					const visiting: any[] = [];
					let visited = visitedPaths[arrPath];
					if (!visited) {
						visited = visitedPaths[arrPath] = [];
					}

					for (let i = 0, il = arr.length; i < il; i++) {
						// keep track of what data we've looked at
						const item = arr[i];
						const index = visited.indexOf(item['id']);
						if (index !== -1) {
							visited.splice(index, 1);
						}
						visiting.push(item['id']);
						// first append the item in the array and its position to the arguments
						const tempPrefill = prefill.concat(item);
						const tempPrefilledByPaths = prefilledByPaths.concat([arrPath]);
						let iargs = args.concat([arr[i]]);
						// load the cache
						const cacheKey = buildCacheKey(path, prefill.concat([arr[i]]));
						// calculate all children (with matching prefilled arguments) and append those
						const children = this.buildFromPath(rootContext, path, tempPrefill, tempPrefilledByPaths);
						childrenCache[cacheKey] = children;
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
						const [context, view] = followPath(rootContext, path);
						const newView: View<any> = view.apply(context, iargs);
						if (oldView && oldView !== newView) {
							throw 'Expected view to be reused when calling ' + path;
						}
						this._cacheView(newView, cacheKey, tempPrefill, tempPrefilledByPaths);
						childViews.push(newView);
					}

					for (let i = 0, il = visited.length; i < il; i++) {
						// all these views are now stale
						if (viewsByPath[arrPath] && viewsByPath[arrPath][visited[i]]) {
							const views = viewsByPath[arrPath][visited[i]];
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
					const cacheKey = buildCacheKey(path, prefill);
					const children = this.buildFromPath(rootContext, path, prefill, prefilledByPaths);
					childrenCache[cacheKey] = children;
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

					const [context, view] = followPath(rootContext, path);
					const newView: View<any> = view.apply(context, args);
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

	build<T>(rootContext: any): View<T> {
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
