import { Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';
import createHeaderNode from './nodes/createHeaderNode';
import createHeaderView from './nodes/createHeaderView';
import createHeaderCell from './nodes/createHeaderCell';
import createHeaderCellView from './nodes/createHeaderCellView';
import createBodyNode from './nodes/createBodyNode';
import createRow from './nodes/createRow';
import createRowView from './nodes/createRowView';
import createCell from './nodes/createCell';
import createCellView from './nodes/createCellView';
import { w, registry } from 'dojo-widgets/d';

registry.define('dgrid-header', createHeaderNode);
registry.define('dgrid-header-view', createHeaderView);
registry.define('dgrid-header-cell', createHeaderCell);
registry.define('dgrid-header-cell-view', createHeaderCellView);
registry.define('dgrid-body', createBodyNode);
registry.define('dgrid-row', createRow);
registry.define('dgrid-row-view', createRowView);
registry.define('dgrid-cell', createCell);
registry.define('dgrid-cell-view', createCellView);

export interface DgridState extends WidgetState {
}

interface DgridOptions extends WidgetOptions<DgridState> { }

export type Dgrid = Widget<DgridState>;

const createDgrid = createWidgetBase.override({
	tagName: 'div',
	classes: ['dgrid-widgets', 'dgrid', 'dgrid-grid'],
	nodeAttributes: [
		function () {
			return {
				role: 'grid'
			};
		}
	],
	getChildrenNodes: function() {
		return [w('dgrid-header', {}), w('dgrid-body', {})];
	}
});

export default createDgrid;
