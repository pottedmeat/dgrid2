import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widget-core/interfaces';
import createWidgetBase from '@dojo/widget-core/createWidgetBase';
import registryMixin, { RegistryMixin, RegistryMixinProperties } from '@dojo/widget-core/mixins/registryMixin';
import { v, w } from '@dojo/widget-core/d';
import { Column, ItemProperties } from './createDgrid';

export interface DgridBodyProperties extends WidgetProperties, RegistryMixinProperties {
	columns: Column[];
	items: ItemProperties[];
	onToggleExpandedRequest(item: ItemProperties): void;
}

export interface DgridBodyMixin extends WidgetMixin<DgridBodyProperties>, RegistryMixin { }

export type DgridBody = Widget<DgridBodyProperties> & DgridBodyMixin

export interface DgridBodyFactory extends WidgetFactory<DgridBodyMixin, DgridBodyProperties> { }

const createDgridBody: DgridBodyFactory = createWidgetBase
.mixin(registryMixin)
.mixin({
	mixin: {
		classes: [ 'dgrid-scroller' ],
		getChildrenNodes(this: DgridBody): DNode[] {
			const {
				properties: {
					items,
					columns,
					registry,
					onToggleExpandedRequest
				}
			} = this;

			return [ v('div.dgrid-content', items.map((item) => {
					return w('dgrid-row', {
						key: item.id,
						item,
						columns,
						registry,
						onToggleExpandedRequest
					});
				}))
			];
		}
	}
});

export default createDgridBody;
