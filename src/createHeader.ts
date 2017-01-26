import { VNodeProperties } from '@dojo/interfaces/vdom';
import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widgets/interfaces';
import createWidgetBase from '@dojo/widgets/createWidgetBase';
import registryMixin, { RegistryMixin, RegistryMixinProperties }  from '@dojo/widgets/mixins/registryMixin';
import { v, w } from '@dojo/widgets/d';
import { Column, SortDetail } from './createDgrid';

export interface DgridHeaderProperties extends WidgetProperties, RegistryMixinProperties {
	columns: Column[];
	sortDetails?: SortDetail[];
	onSortRequest(sortDetail: SortDetail): void;
}

export interface DgridHeaderMixin extends WidgetMixin<DgridHeaderProperties>, RegistryMixin { }

export type DgridHeader = Widget<DgridHeaderProperties>

export interface DgridHeaderFactory extends WidgetFactory<DgridHeader, DgridHeaderProperties> { }

const createDgridHeader: DgridHeaderFactory = createWidgetBase
	.mixin(registryMixin)
	.mixin({
		mixin: {
			classes: ['dgrid-header', 'dgrid-header-row'],
			nodeAttributes: [
				function(this: DgridHeader): VNodeProperties {
					return { role: 'row' };
				}
			],
			getChildrenNodes(this: DgridHeader): DNode[] {
				const { properties: { onSortRequest, columns = [], sortDetails = [] } } = this;

				return [
					v('table.dgrid-row-table', { role: 'presentation' }, [
						v('tr', columns.map((column) => {
							let sort: SortDetail = null;
							for (const sortDetail of sortDetails) {
								if (sortDetail.columnId === column.id) {
									sort = sortDetail;
									break;
								}
							}

							return w('dgrid-header-cell', {
								key: column.id,
								column,
								sortDetails: sort,
								onSortRequest
							});
						}))
					])
				];
			}
		}
	});

export default createDgridHeader;
