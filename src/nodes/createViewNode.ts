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
	]
});
