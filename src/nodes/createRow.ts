import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';

export interface DgridRowProperties extends WidgetProperties {}

export interface DgridRowFactory extends ComposeFactory<Widget<DgridRowProperties>, WidgetOptions<WidgetState, DgridRowProperties>> {}

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin({
		mixin: {
			getRowViewProperties(): any {
				const {
					registry,
					properties: {
						columns,
						item,
						id: itemIdentifier
					}
				} = this;

				return {
					registry,
					columns,
					item,
					itemIdentifier
				};
			}
		}
	})
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
		assignProperties(previousProperties: DgridRowProperties, newProperties: DgridRowProperties) {
			return newProperties;
		},
		getChildrenNodes: function () {
			return [
				w('dgrid-row-view', this.getRowViewProperties())
			];
		}
	});
