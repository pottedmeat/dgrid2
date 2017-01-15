import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';

export interface DgridCellViewProperties extends WidgetProperties {}

export interface DgridCellViewFactory extends ComposeFactory<Widget<DgridCellViewProperties>, WidgetOptions<WidgetState, DgridCellViewProperties>> {}

export default createWidgetBase
	.mixin({
		mixin: {
			getItem() {
				return this.properties.item;
			}
		}
	})
	.override({
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function() {
			const {
				properties: {
					column
				}
			} = this;
			const item = this.getItem();

			const value = item[column.field];
			return value ? [ '' + item[column.field] ] : [];
		}
	});
