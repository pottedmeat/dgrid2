import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { filteredDiffProperties } from '../util';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.around('diffProperties', filteredDiffProperties('columns'))
	.override({
		tagName: 'table',
		classes: ['dgrid-row-table'],
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

			return [
				v('tr', {},
					columns.map(column => {
						return w('dgrid-cell', {
							id: column.id,
							registry,
							properties: {
								column,
								item: properties.item
							}
						});
					})
				)
			];
		}
	});
