import { Widget, WidgetOptions, WidgetState, WidgetProperties } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';
import createHeader from './nodes/createHeader';
import createHeaderView from './nodes/createHeaderView';
import createHeaderCell from './nodes/createHeaderCell';
import createHeaderCellView from './nodes/createHeaderCellView';
import createHeaderScroll from './nodes/createHeaderScroll';
import createBody from './nodes/createBody';
import createRow from './nodes/createRow';
import createRowView from './nodes/createRowView';
import createCell from './nodes/createCell';
import createCellView from './nodes/createCellView';
import { w, registry } from 'dojo-widgets/d';
import { getScrollbarSize } from './util';

registry.define('dgrid-header', createHeader);
registry.define('dgrid-header-view', createHeaderView);
registry.define('dgrid-header-cell', createHeaderCell);
registry.define('dgrid-header-cell-view', createHeaderCellView);
registry.define('dgrid-header-scroll', createHeaderScroll);
registry.define('dgrid-body', createBody);
registry.define('dgrid-row', createRow);
registry.define('dgrid-row-view', createRowView);
registry.define('dgrid-cell', createCell);
registry.define('dgrid-cell-view', createCellView);

export interface Sort {
	property: string;
	descending: boolean;
}

export interface SortTarget extends HTMLElement {
	sortable: boolean;
	field: string;
	columnId: string;
	parentElement: SortTarget;
	getAttribute(name: 'field' | 'columnId'): string | null;
}

export interface SortEvent {
	event: (MouseEvent | KeyboardEvent);
	target: SortTarget;
}

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
	sort?: Sort[];
}

export interface HasItem {
	item: any;
}

export interface HasItemIdentifier {
	itemIdentifier: string;
}

export interface HasSortEvent {
	onSortEvent: (event: SortEvent) => void;
}

export interface HasScrollbarSize {
	scrollbarSize: {
		width: number;
		height: number;
	};
}

export interface DgridState extends WidgetState, HasColumns, HasCollection, HasScrollbarSize { }

export interface DgridProperties extends WidgetProperties, HasColumns, HasCollection { }

export interface DgridOptions extends WidgetOptions<DgridState, DgridProperties> { }

function onSort(this: Widget<DgridState, DgridProperties>, event: SortEvent) {
	const state = <DgridState> this.state;
	const sort = state.sort;

	const target = event.target;
	const field = (target.getAttribute('field') || target.getAttribute('columnId'));
	const currentSort = (sort && sort[0]);
	let newSort: Sort[] = [{
		property: field,
		descending: (currentSort && currentSort.property === field && !currentSort.descending)
	}];
	state.sort = newSort;
	this.invalidate();
}

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
		diffProperties<T extends HasCollection & HasColumns>(this: { properties: T }, previousProperties: T): string[] {
			return [];
		},
		getChildrenNodes: function() {
			const {
				state,
				properties,
				registry
			} = this;
			if (!state.scrollbarSize) {
				state.scrollbarSize = getScrollbarSize(document.createElement('div'));
			}

			const onSortEvent = onSort.bind(this);

			return [
				w('dgrid-header', {
					registry,
					properties: {
						scrollbarSize: state.scrollbarSize,
						columns: properties.columns,
						onSortEvent
					}
				}),
				w('dgrid-header-scroll', {
					registry,
					properties: {
						scrollbarSize: state.scrollbarSize
					}
				}),
				w('dgrid-body', {
					registry,
					properties: {
						columns: properties.columns,
						sort: state.sort,
						collection: properties.collection
					}
				})
			];
		}
	});

export default createDgrid;
