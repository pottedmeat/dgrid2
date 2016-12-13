import createWidgetBase from 'dojo-widgets/createWidgetBase';
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
	getChildrenNodes: function () {
		return [ w('dgrid-cell-view', {}) ];
	}
});