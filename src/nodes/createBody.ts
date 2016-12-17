import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w, v } from 'dojo-widgets/d';

export default createWidgetBase.override({
	tagName: 'div',
	classes: ['dgrid-scroller'],
	getChildrenNodes: function () {
		return [ v('div.dgrid-content', {}, [ w('dgrid-row', {}) ] ) ];
	}
});
