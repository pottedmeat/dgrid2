import { Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';
import createHeader from './nodes/createHeader';
import createHeaderView from './nodes/createHeaderView';
import createHeaderCell from './nodes/createHeaderCell';
import createHeaderCellView from './nodes/createHeaderCellView';
import createBody from './nodes/createBody';
import createRow from './nodes/createRow';
import createRowView from './nodes/createRowView';
import createCell from './nodes/createCell';
import createCellView from './nodes/createCellView';
import { w, registry } from 'dojo-widgets/d';

registry.define('dgrid-header', createHeader);
registry.define('dgrid-header-view', createHeaderView);
registry.define('dgrid-header-cell', createHeaderCell);
registry.define('dgrid-header-cell-view', createHeaderCellView);
registry.define('dgrid-body', createBody);
registry.define('dgrid-row', createRow);
registry.define('dgrid-row-view', createRowView);
registry.define('dgrid-cell', createCell);
registry.define('dgrid-cell-view', createCellView);

export interface Column {
	id: string;
	label: string;
	field?: string;
	sortable?: boolean;
}

export interface ColumnsState {
	columns: Column[];
}

export interface ColumnState {
	column: Column;
}

export interface DgridState extends WidgetState, ColumnsState { }

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
		return [w('dgrid-header', { state: this.state }), w('dgrid-body', { state: this.state })];
	}
});

export default createDgrid;
