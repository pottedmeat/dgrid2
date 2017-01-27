import { VNodeProperties } from '@dojo/interfaces/vdom';
import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widget-core/interfaces';
import createWidgetBase from '@dojo/widget-core/createWidgetBase';
import registryMixin, { RegistryMixin, RegistryMixinProperties } from '@dojo/widget-core/mixins/registryMixin';
import { w } from '@dojo/widget-core/d';

import { Column, ItemProperties } from './createDgrid';

export interface DgridRowViewProperties extends WidgetProperties, RegistryMixinProperties {
	item: any;
	columns: Column[];
	onToggleExpandedRequest(item: ItemProperties): void;

}

export interface DgridRowViewMixin extends WidgetMixin<DgridRowViewProperties>, RegistryMixin { }

export type DgridRowView = Widget<DgridRowViewProperties>

export interface DgridRowViewFactory extends WidgetFactory<DgridRowView, DgridRowViewProperties> { }

const createDgridRowView: DgridRowViewFactory = createWidgetBase
	.mixin(registryMixin)
	.mixin({
		mixin: {
			tagName: 'tr',
			classes: [ 'dgrid-row' ],
			nodeAttributes: [
				function(this: DgridRowView): VNodeProperties {
					return { role: 'row' };
				}
			],
			getChildrenNodes(this: DgridRowView): DNode[] {
				const {
					properties: {
						item,
						columns = [],
						onToggleExpandedRequest
					}
				} = this;

				return columns.map(({ id, field, renderer, renderExpando }) => {
					return w('dgrid-cell', {
						key: id,
						item: item,
						data: item.data[field],
						expandedLevel: item.expandedLevel,
						isExpanded: item.isExpanded,
						canExpand: item.canExpand,
						renderer,
						renderExpando,
						onToggleExpandedRequest
					});
				});
			}
		}
	});

export default createDgridRowView;
