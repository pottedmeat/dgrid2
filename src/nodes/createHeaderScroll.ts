import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';

export interface DgridHeaderScrollProperties extends WidgetProperties {}

export interface DgridHeaderScrollFactory extends ComposeFactory<Widget<DgridHeaderScrollProperties>, WidgetOptions<WidgetState, DgridHeaderScrollProperties>> {}

export default createWidgetBase
	.override({
		classes: [ 'dgrid-header', 'dgrid-header-scroll', 'dgrid-scrollbar-width' ],
		nodeAttributes: [
			function () {
				const {
					scrollbarSize: { width: scrollbarWidth }
				} = this.properties;

				return {
					style: 'width:' + scrollbarWidth + 'px'
				};
			}
		],
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		}
	});
