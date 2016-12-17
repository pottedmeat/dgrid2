import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnState } from '../createDgrid';
import { w } from 'dojo-widgets/d';

export default createWidgetBase.override({
	tagName: 'td',
	classes: ['dgrid-cell'],
	nodeAttributes: [
		function () {
			return {
				role: 'gridcell'
			};
		}
	],
	getChildrenNodes: function (this: Widget<WidgetState & ColumnState>) {
		return [ w('dgrid-cell-view', { state: this.state }) ];
	}
});
