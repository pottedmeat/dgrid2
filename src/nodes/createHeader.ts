import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';

export default createWidgetBase.override({
	tagName: 'div',
	classes: ['dgrid-header', 'dgrid-header-row'],
	listeners: {
		onclick: function(ev: MouseEvent) {
			console.log('header', this, arguments);
		}
	},
	nodeAttributes: [
		function () {
			return {
				role: 'row'
			};
		}
	],
	getChildrenNodes: function () {
		return [ w('dgrid-header-view', { state: this.state }) ];
	}
});
