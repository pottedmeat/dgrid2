import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.around('diffProperties', function(diffProperties: (previousProperties: HasColumns) => string[]) {
		return function(previousProperties: HasColumns) {
			const changedPropertyKeys: string[] = diffProperties.call(this, {
				columns: previousProperties.columns
			});
			return changedPropertyKeys.filter((key) => {
				return (key === 'columns');
			});
		};
	})
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
