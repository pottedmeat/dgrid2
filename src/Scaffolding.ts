import { GenericFunction } from 'dojo-compose/compose';
import View from './interfaces/View';

interface Scaffold {
	parent?: string;
	on?: string;
}

interface ObjectLiteral {
	[key: string]: ObjectLiteral;
}

function followPath<T>(context: any, path: string): [ObjectLiteral, GenericFunction<View<T>>] {
	const keys = path.split('.');
	for (let i = 0, il = (keys.length - 1); i < il; i++) {
		const key = keys[i];
		if (!context[key]) {
			return null;
		}
		context = context[key];
	}
	const key = keys[keys.length - 1];
	return [context, <any> context[key]];
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
	buildFromPath<T>(rootContext: any, rootPath?: string): View<T>[] {
		let childViews: View<T>[] = [];
		const paths = this.byAdded,
			pathInfo = this.byPath;
		for (let i = 0, il = paths.length; i < il; i++) {
			const path = paths[i];
			const info = pathInfo[path];
			let found = false;
			if (rootPath) {
				found = (info && info.parent === rootPath);
			}
			else {
				found = (!info || !info.parent);
			}
			if (found) {
				const [context, view] = followPath(rootContext, path);
				let args = [rootContext].concat(this.buildFromPath(rootContext, path).map(function(value: View<T>) {
					return value.render;
				}));
				const cache = this.caches[path];
				if (cache) {
					args.push(cache);
				}
				const childView: View<any> = view.apply(context, args);
				this.caches[path] = childView;
				childViews.push(childView);
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
