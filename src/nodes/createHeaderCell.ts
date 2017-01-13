import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { HasSort } from '../createDgrid';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'th',
		classes: ['dgrid-cell'],
		nodeAttributes: [
			function () {
				const {
					column,
					sort
				} = this.properties;

				return {
					classes: {
						'dgrid-sort-up': sort && !sort.descending,
						'dgrid-sort-down': sort && sort.descending
					},
					role: 'columnheader',
					sortable: column.sortable,
					field: column.field,
					columnId: column.id
				};
			}
		],
		diffProperties(previousProperties: HasSort, newProperties: HasSort): string[] {
			const changedPropertyKeys: string[] = [];
			if (previousProperties.sort !== newProperties.sort) {
				changedPropertyKeys.push('sort');
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
				column,
				sort
			} = properties;

			const children = [
				w('dgrid-header-cell-view', {
					registry,
					column
				})
			];

			if (sort) {
				children.unshift(w('dgrid-sort-arrow', {
					registry
				}));
			}
			return children;
		}
	});
