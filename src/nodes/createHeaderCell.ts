import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnState } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';

export default createWidgetBase.override({
	tagName: 'th',
	classes: ['dgrid-cell'],
	nodeAttributes: [
		function () {
			return {
				role: 'columnheader'
			};
		}
	],
	getChildrenNodes: function (this: Widget<WidgetState & ColumnState>) {
		const {
			column
		} = this.state;
		return [ w('dgrid-header-cell-view', {
			state: {
				column: column
			}
		}) ];
	}
});