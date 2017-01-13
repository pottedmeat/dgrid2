import { Widget, WidgetOptions, WidgetState, WidgetProperties } from 'dojo-widgets/interfaces';
import { Column } from './models/createColumn';
import createColumns  from './models/createColumns';
import { Sort } from './models/createSort';
import createSortArray from './models/createSortArray';
import createWidgetBase from 'dojo-widgets/createWidgetBase';
import createHeader from './nodes/createHeader';
import createHeaderView from './nodes/createHeaderView';
import createHeaderCell from './nodes/createHeaderCell';
import createSortArrow from './nodes/createSortArrow';
import createHeaderCellView from './nodes/createHeaderCellView';
import createHeaderScroll from './nodes/createHeaderScroll';
import createBody from './nodes/createBody';
import createRow from './nodes/createRow';
import createRowView from './nodes/createRowView';
import createCell from './nodes/createCell';
import createCellView from './nodes/createCellView';
import { w, registry } from 'dojo-widgets/d';
import { getScrollbarSize } from './util';
import createDelegatingFactoryRegistryMixin from './mixins/createDelegatingFactoryRegistryMixin';

registry.define('dgrid-header', createHeader);
registry.define('dgrid-header-view', createHeaderView);
registry.define('dgrid-header-cell', createHeaderCell);
registry.define('dgrid-sort-arrow', createSortArrow);
registry.define('dgrid-header-cell-view', createHeaderCellView);
registry.define('dgrid-header-scroll', createHeaderScroll);
registry.define('dgrid-body', createBody);
registry.define('dgrid-row', createRow);
registry.define('dgrid-row-view', createRowView);
registry.define('dgrid-cell', createCell);
registry.define('dgrid-cell-view', createCellView);

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

export interface HasColumns {
	columns: Column[];
}

export interface HasColumn {
	column: Column;
}

export interface HasCollection {
	collection?: any;
}

export interface HasSort {
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

export interface DgridState extends WidgetState, HasColumns, HasCollection, HasSort, HasScrollbarSize { }

export interface DgridProperties extends WidgetProperties, HasColumns, HasSort, HasCollection { }

export interface DgridOptions extends WidgetOptions<DgridState, DgridProperties> { }

function onSort(this: Widget<DgridProperties>, event: SortEvent) {
	const state = <DgridState> this.state;
	const sort = state.sort;

	const target = event.target;
	const field = (target.getAttribute('field') || target.getAttribute('columnId'));
	const currentSort = (sort && sort[0]);
	let newSort: Sort[] = [{
		property: field,
		descending: !!(currentSort && currentSort.property === field && !currentSort.descending)
	}];
	state.sort = createSortArray(newSort);
	this.invalidate();
}

const createDgrid = createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
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
		diffProperties(previousProperties: DgridProperties, newProperties: DgridProperties): string[] {
			const changedPropertyKeys: string[] = [];
			// compare collection by reference
			if (previousProperties.collection !== newProperties.collection) {
				changedPropertyKeys.push('collection');
			}
			// use createColumns to get a static representation of the columns for comparison
			newProperties.columns = createColumns(newProperties.columns);
			if (previousProperties.columns !== newProperties.columns) {
				changedPropertyKeys.push('columns');
			}
			// use createSortArray to get a static representation of the sort for comparison
			if (!newProperties.sort) {
				// use the value stored in state in case the user decides to manualy update sort through properties
				newProperties.sort = this.state.sort;
			}
			if (newProperties.sort) {
				// handle sorting if passed in the properties
				newProperties.sort = createSortArray(newProperties.sort);
				if (previousProperties.sort !== newProperties.sort) {
					changedPropertyKeys.push('sort');
				}
			}

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

			return [
				w('dgrid-header', {
					registry,
					scrollbarSize: state.scrollbarSize,
					columns: properties.columns,
					sort: state.sort,
					onSortEvent: onSort.bind(this)
				}),
				w('dgrid-header-scroll', {
					registry,
					scrollbarSize: state.scrollbarSize
				}),
				w('dgrid-body', {
					registry,
					columns: properties.columns,
					sort: state.sort,
					data: properties.data,
					idProperty: properties.idProperty,
					collection: properties.collection
				})
			];
		}
	});

export default createDgrid;
