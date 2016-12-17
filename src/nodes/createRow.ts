import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';

export default createWidgetBase.override({
	classes: [ 'dgrid-row' ],
	nodeAttributes: [
		function () {
			return {
				role: 'row'
			};
		}
	],
	getChildrenNodes: function () {
		return [ w('dgrid-row-view', { state: this.state }) ];
	}
});
