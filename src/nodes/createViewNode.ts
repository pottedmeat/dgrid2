import createDgridNode from './createDgridNode';
import { VNodeProperties } from 'dojo-interfaces/vdom';

export default createDgridNode.override({
	tagName: 'div',
	classes: ['dgrid-widgets', 'dgrid', 'dgrid-grid'],
	nodeAttributes: [
		function (): VNodeProperties {
			return {
				role: 'grid'
			};
		}
	],
	getChildrenNodes: function() {
		// By default, scaffolding can insert children as specified
		// Or I can call another function that returns them:
		//	keyed would be best, but the order would be important too

		// I wouldn't want to assign things directly to children
	}
});
