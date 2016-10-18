import View from './interfaces/View';

interface Scaffold {
	parent?: string;
	groupChildren?: boolean;
	on?: string;
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

class Scaffolding {
	byPath: {[key: string]: Scaffold};
	byAdded: string[];
	caches: {[key: string]: View<any>};

	constructor() {
		this.byPath = {};
		this.byAdded = [];
		this.caches = {};
	}

	add(path: string, info?: Scaffold) {
		this.byPath[path] = info;
		this.byAdded.push(path);
	}

	// return all children of this parent in an array
	buildFromPath<T>(rootContext: any, rootPath?: string, prefill?: any): View<T>[] {
		let childViews: View<T>[] = [];
		const paths = this.byAdded,
			pathsInfo = this.byPath,
			rootInfo = (rootPath ? pathsInfo[rootPath] : null);
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
						// calculate all children (with matching prefilled arguments) and append those
						const renderers = this.buildFromPath(rootContext, path, prefill.concat([arr[i]])).map(function(value: View<T>) {
							return value.render;
						});
						if (info && info.groupChildren) {
							iargs.push(renderers);
						}
						else {
							iargs = iargs.concat(renderers);
						}
						// call the method with these arguments
						const [context, view] = followPath(rootContext, path);
						childViews.push(view.apply(context, iargs));
					}
				}
				else {
					const [context, view] = followPath(rootContext, path);
					const renderers = this.buildFromPath(rootContext, path, prefill).map(function(value: View<T>) {
						return value.render;
					});
					if (info && info.groupChildren) {
						args.push(renderers);
					}
					else {
						args = args.concat(renderers);
					}
					let cacheKey: string = '';
					if (prefill) {
						// TODO: More complicated cache key
						cacheKey = prefill.map(function(value: any) {
							return value['id'];
						}).join(',') + ',';
					}
					cacheKey += path;
					const cache = this.caches[cacheKey];
					if (cache) {
						args.push(cache);
					}
					const childView: View<any> = view.apply(context, args);
					if (!cache || cache !== childView) {
						if (cache) {
							// TODO: Notify the renderer that this child has changed
						}
						this.caches[cacheKey] = childView;
					}
					childViews.push(childView);
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
