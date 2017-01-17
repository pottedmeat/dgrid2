import createWidgetBase from '@dojo/widgets/createWidgetBase';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from '@dojo/widgets/interfaces';
import { ComposeFactory } from '@dojo/compose/compose';

export interface DgridHeaderCellViewProperties extends WidgetProperties {}

export interface DgridHeaderCellViewFactory extends ComposeFactory<Widget<DgridHeaderCellViewProperties>, WidgetOptions<WidgetState, DgridHeaderCellViewProperties>> {}

export default createWidgetBase
	.override({
		tagName: 'span',
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function () {
			const {
				column
			} = this.properties;

			return [ column.label ];
		}
	});
