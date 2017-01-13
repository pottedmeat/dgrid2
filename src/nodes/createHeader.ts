import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { HasSort } from '../createDgrid';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'div',
		classes: ['dgrid-header', 'dgrid-header-row'],
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
			const properties = this.properties;

			return [
				w('dgrid-header-view', {
					registry: this.registry,
					columns: properties.columns,
					sort: properties.sort,
					onSortEvent: properties.onSortEvent
				})
			];
		}
	});
