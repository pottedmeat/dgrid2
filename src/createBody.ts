import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widgets/interfaces';
import createWidgetBase from '@dojo/widgets/createWidgetBase';
import registryMixin, { RegistryMixin, RegistryMixinProperties } from '@dojo/widgets/mixins/registryMixin';
import { v, w } from '@dojo/widgets/d';
import { Column, ItemProperties } from './createDgrid';

export interface DgridBodyProperties extends WidgetProperties, RegistryMixinProperties {
	columns: Column[];
	items: ItemProperties[];
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
			const { properties: { items, columns, registry } } = this;

			return [ v('div.dgrid-content', items.map((item) => {
					return w('dgrid-row', { key: item.id, item, columns, registry });
				}))
			];
		}
	}
});

export default createDgridBody;
