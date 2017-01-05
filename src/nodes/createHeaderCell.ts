import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
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
					column
				} = this.properties;

				return {
					role: 'columnheader',
					sortable: column.sortable,
					field: column.field,
					columnId: column.id
				};
			}
		],
		diffProperties(): string[] {
			return [];
		},
		getChildrenNodes: function () {
			const {
				properties,
				registry
			} = this;

			return [
				w('dgrid-header-cell-view', {
					registry,
					properties: {
						column: properties.column,
						onSortEvent: properties.onSortEvent
					}
				})
			];
		}
	});
