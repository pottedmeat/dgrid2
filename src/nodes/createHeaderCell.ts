import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';
import { filteredDiffProperties } from '../util';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.around('diffProperties', filteredDiffProperties('sort'))
	.override({
		tagName: 'th',
		classes: ['dgrid-cell'],
		listeners: <VNodeListeners> {
			onclick: function (ev: MouseEvent) {
				console.log('cell', this, arguments);
			}
		},
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
					properties: {
						column,
						onSortEvent: properties.onSortEvent
					}
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
