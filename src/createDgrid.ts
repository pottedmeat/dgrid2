import { Widget, WidgetOptions, WidgetState, WidgetProperties } from 'dojo-widgets/interfaces';
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
import { create } from 'dojo-core/lang';
import { HeaderOptions } from './nodes/createHeader';
import { BodyOptions } from './nodes/createBody';

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

export interface HasColumns {
	columns: Column[];
}

export interface HasColumn {
	column: Column;
}

export interface HasCollection {
	collection?: any;
}

export interface HasItem {
	item: any;
}

export interface HasItemIdentifier {
	itemIdentifier: string;
}

export interface HasParent {
	parent: Widget<WidgetState, WidgetProperties>;
}

export interface DgridState extends WidgetState, HasColumns, HasCollection { }

export interface DgridProperties extends WidgetProperties, HasColumns, HasCollection {}

export interface DgridOptions extends WidgetOptions<DgridState, DgridProperties> { }

export type DgridNodeOptions<S, P> = WidgetOptions<WidgetState & HasParent & S, HasColumns & HasCollection & P>;

export type DgridNode<S, P> = Widget<WidgetState & S, HasColumns & HasCollection & P>;

const createDgrid = createWidgetBase
	.override(<DgridOptions> {
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
			return [
				w('dgrid-header', <HeaderOptions> {
					parent: this,
					properties: create(this.properties, null)
				}),
				w('dgrid-body', <BodyOptions> {
					parent: this,
					properties: create(this.properties, null)
				})
			];
		}
	});

export default createDgrid;
