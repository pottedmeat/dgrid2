import createWidgetBase from 'dojo-widgets/createWidgetBase';
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
	getChildrenNodes: function () {
		return [ w('dgrid-header-cell-view', {}) ];
	}
});