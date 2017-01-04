import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'div',
		classes: ['dgrid-header', 'dgrid-header-row'],
		listeners: <VNodeListeners> {
			onclick: function(ev: MouseEvent) {
				console.log('header', this, arguments);
			}
		},
		nodeAttributes: [
			function () {
				const {
					scrollbarSize: { width: scrollbarWidth }
				} = this.properties;

				return {
					role: 'row',
					style: 'right:' + scrollbarWidth + 'px'
				};
			}
		],
		diffProperties(): string[] {
			return [];
		},
		getChildrenNodes: function () {
			const properties = this.properties;

			return [
				w('dgrid-header-view', {
					registry: this.registry,
					properties: {
						columns: properties.columns,
						onSortEvent: properties.onSortEvent
					}
				})
			];
		}
	});
