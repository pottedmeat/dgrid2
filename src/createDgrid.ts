import { DNode, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { DgridNodeFactory, DgridNodeOptions } from './nodes/createDgridNode';
import createViewNode from './nodes/createViewNode';
import createHeaderNode from './nodes/createHeaderNode';
import createBodyNode from './nodes/createBodyNode';
import d from 'dojo-widgets/d';

export interface DescendantInfo<T> {
	id: string;
	parent?: string;
	groupChildren?: boolean;
	over?: () => T[];
	identify?: (item: T) => string;
}

interface ExtendedDescendantInfo<T> extends DescendantInfo<T> {
	callbackId: string;
}

export interface DgridState extends WidgetState {
	headAncestor?: Widget<any>;
	descendants?: { [key: string]: ExtendedDescendantInfo<any> };
}

interface DgridOptions extends WidgetOptions<DgridState> { }

export type Dgrid = Widget<DgridState> & {
	addDescendant: (context: any, callback: DgridNodeFactory, options: DescendantInfo<any>) => void;
	getChildDescendants: (descendantId: string) => DNode[];
};

const createDgrid = createWidgetBase.override({
	render: function(this: Dgrid) {
		let {
			headAncestor,
			descendants
		} = this.state;
		if (!headAncestor) {
			for (const id in descendants) {
				const descendantInfo = descendants[id];
				if (!descendantInfo.parent) {
					const factory: DgridNodeFactory = (<any> this)[descendantInfo.callbackId];
					const node = factory({
						state: {
							descendantId: id,
							grid: this
						}
					});
					headAncestor = this.state.headAncestor = node;
					break;
				}
			}
		}
		return headAncestor.render.apply(headAncestor, arguments);
	}
}).mixin({
	initialize: function(instance) {
		instance.addDescendant(instance, instance._view, {
			id: 'view'
		});
		instance.addDescendant(instance, instance._header, {
			id: 'header',
			parent: 'view'
		});
		instance.addDescendant(instance, instance._body, {
			id: 'body',
			parent: 'view'
		});
	},
	mixin: {
		_view: createViewNode,
		_header: createHeaderNode,
		_body: createBodyNode,
		addDescendant: function(this: Dgrid, context: any, callback: DgridNodeFactory, options: DescendantInfo<any>) {
			const {
				descendants = {}
			} = this.state;

			const extendedOptions = <ExtendedDescendantInfo<any>> options;
			for (const key in this) {
				if ((<any> this)[key] === callback) {
					extendedOptions.callbackId = key;
					break;
				}
			}
			if (!extendedOptions.callbackId) {
				throw 'addDescendant: callback is not a property of context';
			}

			descendants[options.id] = extendedOptions;

			this.state.descendants = descendants;
		},
		getChildDescendants: function (this: Dgrid, descendantId: string) {
			const {
				descendants = {}
			} = this.state;

			const children: DNode[] = [];
			for (const id in descendants) {
				const descendantInfo = descendants[id];
				if (descendantInfo.parent === descendantId) {
					const factory: DgridNodeFactory = (<any> this)[descendantInfo.callbackId];
					const node = d(factory, <DgridNodeOptions> {
						state: {
							descendantId: id,
							grid: this
						}
					});
					children.push(node);
					(<any> children)[id] = node;
				}
			}

			this.state.descendants = descendants;

			return children;
		}
	}
});

export default createDgrid;
