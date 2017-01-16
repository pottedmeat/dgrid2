import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import delegatingFactoryRegistryMixin from '../mixins/delegatingFactoryRegistryMixin';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';

export interface DgridCellProperties extends WidgetProperties {}

export interface DgridCellFactory extends ComposeFactory<Widget<DgridCellProperties>, WidgetOptions<WidgetState, DgridCellProperties>> {}

export default createWidgetBase
	.mixin(delegatingFactoryRegistryMixin)
	.mixin({
		mixin: {
			getCellViewProperties(): any {
				const {
					registry,
					properties: {
						item,
						itemIdentifier,
						column
					}
				} = this;

				return {
					registry,
					item,
					itemIdentifier,
					column
				};
			}
		}
	})
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
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function () {
			return [
				w('dgrid-cell-view', this.getCellViewProperties())
			];
		}
	});
