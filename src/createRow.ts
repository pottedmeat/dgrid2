import { VNodeProperties } from '@dojo/interfaces/vdom';
import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widget-core/interfaces';
import createWidgetBase from '@dojo/widget-core/createWidgetBase';
import registryMixin, { RegistryMixin, RegistryMixinProperties } from '@dojo/widget-core/mixins/registryMixin';
import { v, w } from '@dojo/widget-core/d';

import { Column, ItemProperties } from './createDgrid';

export interface DgridRowProperties extends WidgetProperties, RegistryMixinProperties {
	item: any;
	columns: Column[];
	onToggleExpandedRequest(item: ItemProperties): void;
}

export interface DgridRowMixin extends WidgetMixin<DgridRowProperties>, RegistryMixin { }

export type DgridRow = Widget<DgridRowProperties>

export interface DgridRowFactory extends WidgetFactory<DgridRowMixin, DgridRowProperties> { }

const createDgridRow: DgridRowFactory = createWidgetBase
	.mixin(registryMixin)
	.mixin({
		mixin: {
			classes: [ 'dgrid-row' ],
			nodeAttributes: [
				function(this: DgridRow): VNodeProperties {
					return { role: 'row' };
				}
			],
			getChildrenNodes(this: DgridRow): DNode[] {
				const {
					properties: {
						item,
						columns,
						registry,
						onToggleExpandedRequest
					}
				} = this;

				return [
					v('table.dgrid-row-table', { styles: { 'background-color': item.color } }, [
						w('dgrid-row-view', {
							registry,
							columns,
							item,
							onToggleExpandedRequest
						} )
					])
				];
			}
		}
	});

export default createDgridRow;
