import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { v, w } from 'dojo-widgets/d';

export default createWidgetBase.override({
	tagName: 'table',
	classes: ['dgrid-row-table'],
	nodeAttributes: [
		function () {
			return {
				role: 'presentation'
			};
		}
	],
	getChildrenNodes: function () {
		return [ v('tr', {},
			[ w('dgrid-cell', {}) ]
		) ];
	}
});