import createWidgetBase from '@dojo/widgets/createWidgetBase';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from '@dojo/widgets/interfaces';
import { ComposeFactory } from '@dojo/compose/compose';

export interface DgridSortArrowProperties extends WidgetProperties {}

export interface DgridSortArrowFactory extends ComposeFactory<Widget<DgridSortArrowProperties>, WidgetOptions<WidgetState, DgridSortArrowProperties>> {}

export default createWidgetBase
	.override({
		tagName: 'div',
		classes: [ 'dgrid-sort-arrow', 'ui-icon' ],
		nodeAttributes: [
			function () {
				return {
					role: 'presentation'
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
			return [ ' ' ];
		}
	});
