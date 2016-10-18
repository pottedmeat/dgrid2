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
	viewCache: {[key: string]: View<any>};
	childrenCache: {[key: string]: View<any>[]};
	shouldReloadParent: string;

	constructor() {
		this.byPath = {};
		this.byAdded = [];
		this.viewCache = {};
		this.childrenCache = {};
	}

	add(path: string, info?: Scaffold) {
		this.byPath[path] = info;
		this.byAdded.push(path);
	}

	reloadAt<T>(rootContext: any, path?: string, prefill?: any[]) {
		this.reloadPath(rootContext, path, prefill, false);
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
		viewCache[cacheKey] = newView;
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
	buildFromPath<T>(rootContext: any, rootPath?: string, prefill?: any[]): View<T>[] {
		let childViews: View<T>[] = [];
		const paths = this.byAdded,
			pathsInfo = this.byPath,
			viewCache = this.viewCache,
			childrenCache = this.childrenCache;
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
					const [, arr] = followPath(rootContext, info.across || info.over);
					for (let i = 0, il = arr.length; i < il; i++) {
						// first append the item in the array and its position to the arguments
						let iargs = args.concat([arr[i]]);
						// load the cache
						const cacheKey = buildCacheKey(path, prefill.concat([arr[i]]));
						// calculate all children (with matching prefilled arguments) and append those
						const children = this.buildFromPath(rootContext, path, prefill.concat([arr[i]]));
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
						viewCache[cacheKey] = newView;
						childViews.push(newView);
					}
				}
				else {
					const cacheKey = buildCacheKey(path, prefill);
					const children = this.buildFromPath(rootContext, path, prefill);
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
					viewCache[cacheKey] = newView;
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
