import createDgridNode from './createDgridNode';
import { VNodeProperties } from 'dojo-interfaces/vdom';

export default createDgridNode.override({
	tagName: 'div',
	classes: ['dgrid-header', 'dgrid-header-row'],
	nodeAttributes: [
		function (): VNodeProperties {
			return {
				role: 'row'
			};
		}
	]
});
