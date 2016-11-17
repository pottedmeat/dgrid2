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
				// TODO: virtual things!
			}
		},
		initialize: function(instance: VirtualScrollingGrid, options: any) {
			// TODO: is there a better way to add an event handler?
			// FIXME: how to extend the rendering process?
			// setting instance.bodyForGrid seems less than ideal, but even that doesn't work - Dgrid's intialize has
			// already set instance.bodyForGrid as the callback in the scaffolding, so we have to delve into there to
			// change it
			instance.scaffolding.infoByPath.bodyForGrid.callback = function bodyForGrid(grid: Dgrid, rows: VNode[], view?: {render: VNode}) {
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
