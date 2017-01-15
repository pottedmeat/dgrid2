import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';

export interface DgridCellViewProperties extends WidgetProperties {}

export interface DgridCellViewFactory extends ComposeFactory<Widget<DgridCellViewProperties>, WidgetOptions<WidgetState, DgridCellViewProperties>> {}

export default createWidgetBase
	.override({
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function() {
			const {
				item,
				column
			} = this.properties;

			const value = item[column.field];
			return value ? [ '' + item[column.field] ] : [];
		}
	});
