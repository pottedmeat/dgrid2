import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
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
		diffProperties(previousProperties: HasColumns, newProperties: HasColumns): string[] {
			const changedPropertyKeys: string[] = [];
			if (previousProperties.columns !== newProperties.columns) {
				changedPropertyKeys.push('columns');
			}
			return changedPropertyKeys;
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
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
							column,
							item: properties.item
						});
					})
				)
			];
		}
	});
