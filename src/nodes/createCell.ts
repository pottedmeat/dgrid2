import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumn} from '../createDgrid';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'td',
		classes: ['dgrid-cell'],
		nodeAttributes: [
			function () {
				return {
					role: 'gridcell'
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
				w('dgrid-cell-view', {
					registry,
					properties: {
						item: properties.item,
						column: properties.column
					}
				})
			];
		}
	});
