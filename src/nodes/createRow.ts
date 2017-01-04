import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { HasItemIdentifier } from '../createDgrid';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		classes: [ 'dgrid-row' ],
		nodeAttributes: [
			function () {
				return {
					role: 'row'
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
				w('dgrid-row-view', {
					registry,
					properties: {
						columns: properties.columns,
						item: properties.item
					}
				})
			];
		}
	});
