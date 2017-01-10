import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';
import { sortedColumn, filteredDiffProperties } from '../util';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.around('diffProperties', filteredDiffProperties('columns', 'sort'))
	.override({
		tagName: 'table',
		classes: ['dgrid-row-table'],
		listeners: <VNodeListeners> {
			onclick: function (ev: MouseEvent) {
				console.log('header view', this, arguments);
			}
		},
		nodeAttributes: [
			function () {
				return {
					role: 'presentation'
				};
			}
		],
		getChildrenNodes: function () {
			const {
				properties,
				registry
			} = this;
			const {
				columns
			} = <HasColumns> properties;

			return [ v('tr', {},
				columns.map(column => {
					return w('dgrid-header-cell', {
						id: column.id,
						registry,
						properties: {
							column,
							sort: sortedColumn(column, properties.sort),
							onSortEvent: properties.onSortEvent
						}
					});
				})
			) ];
		}
	});
