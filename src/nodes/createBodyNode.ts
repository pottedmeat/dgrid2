import createDgridNode from './createDgridNode';
import d from 'dojo-widgets/d';

export default createDgridNode.override({
	tagName: 'div',
	classes: ['dgrid-scroller'],
	getChildrenNodes: function () {
		return [ d('div.dgrid-content', {}, this.getChildDescendants()) ];
	}
});
