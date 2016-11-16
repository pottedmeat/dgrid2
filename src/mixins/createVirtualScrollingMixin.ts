import { ComposeMixinDescriptor } from 'dojo-compose/compose';
import { h, VNode } from 'maquette';
import Dgrid from '../Dgrid';

export interface VirtualScrolling {
	_onScroll: (event: UIEvent) => void;
}

export type VirtualScrollingGrid = VirtualScrolling & Dgrid;

function createVirtualScrollingMixin<T, O, U, P>(): ComposeMixinDescriptor<any, any, any, any> {
	return {
		mixin: {
			_onScroll: function (event: UIEvent) {
				console.dir(event);
			}
		},
		initialize: function(instance: VirtualScrollingGrid, options: any) {
			// TODO: is there a better way to add an event handler and/or extend the rendering process?
			this.bodyForGrid = function bodyForGrid(grid: Dgrid, rows: VNode[], view?: {render: VNode}) {
				view = (view || { render: null });
				view.render = h('div.dgrid-scroller',
					{ onscroll: instance._onScroll },
					[ h('div.dgrid-content', rows) ]
				);
				return view;
			};
		}
	};
};

export default createVirtualScrollingMixin;
