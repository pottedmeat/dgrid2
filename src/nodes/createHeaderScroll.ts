import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumn, DgridNodeOptions, HasItemIdentifier, DgridNode, HasItem } from '../createDgrid';

export type HeaderScrollOptions = DgridNodeOptions<null, HasItemIdentifier & HasItem & HasColumn>;

export type HeaderScroll = DgridNode<null, HasItemIdentifier & HasItem & HasColumn>;

export default createWidgetBase
	.override(<Partial<HeaderScroll>> {
		classes: [ 'dgrid-header', 'dgrid-header-scroll', 'dgrid-scrollbar-width' ],
		applyChangedProperties: function() {
			// no new state
		},
		nodeAttributes: [
			function () {
				const {
					scrollbarSize: { width: scrollbarWidth }
				} = this.properties;

				return {
					style: 'width:' + scrollbarWidth + 'px'
				};
			}
		]
	});
