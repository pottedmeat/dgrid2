import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { HasSort } from '../createDgrid';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';

export interface DgridHeaderProperties extends WidgetProperties {}

export interface DgridHeaderFactory extends ComposeFactory<Widget<DgridHeaderProperties>, WidgetOptions<WidgetState, DgridHeaderProperties>> {}

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin({
		mixin: {
			getHeaderViewProperties(): any {
				const {
					registry,
					properties: {
						columns,
						sort,
						onSortEvent
					}
				} = this;

				return {
					registry,
					columns,
					sort,
					onSortEvent
				};
			}
		}
	})
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
			return [
				w('dgrid-header-view', this.getHeaderViewProperties())
			];
		}
	});
