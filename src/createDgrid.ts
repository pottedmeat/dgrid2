import { Widget, WidgetOptions, WidgetState, WidgetProperties } from 'dojo-widgets/interfaces';
import Evented from 'dojo-core/Evented';
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
import { create } from 'dojo-core/lang';
import { HeaderOptions } from './nodes/createHeader';
import { BodyOptions } from './nodes/createBody';
import { getScrollbarSize } from './util';
import { HeaderScrollOptions } from './nodes/createHeaderScroll';

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
	type: 'dgrid-sort';
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

export interface HasParent {
	parent: Widget<WidgetState, WidgetProperties>;
}

export interface HasEvents {
	events: Evented;
}

export interface HasScrollbarSize {
	scrollbarSize: {
		width: number;
		height: number;
	}
}

export interface DgridState extends WidgetState, HasColumns, HasCollection, HasScrollbarSize { }

export interface DgridProperties extends WidgetProperties, HasColumns, HasCollection, HasEvents, HasScrollbarSize { }

export interface DgridOptions extends WidgetOptions<DgridState, DgridProperties> { }

export type DgridNodeOptions<S, P> = WidgetOptions<WidgetState & HasParent & S, HasColumns & HasCollection & HasEvents & HasScrollbarSize & P>;

export type DgridNode<S, P> = Widget<WidgetState & S, HasColumns & HasCollection & HasEvents & HasScrollbarSize & P>;

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
			if (!this.state.scrollbarSize) {
				this.state.scrollbarSize = getScrollbarSize(document.createElement('div'));
			}
			this.properties.scrollbarSize = this.state.scrollbarSize;

			return [
				w('dgrid-header', <HeaderOptions> {
					parent: this,
					properties: create(this.properties, null)
				}),
				w('dgrid-header-scroll', <HeaderScrollOptions> {
					parent: this,
					properties: create(this.properties, null)
				}),
				w('dgrid-body', <BodyOptions> {
					parent: this,
					properties: create(this.properties, null)
				})
			];
		}
	})
	.mixin({
		initialize (instance: Widget<DgridState, DgridProperties>, options: DgridOptions) {
			const {
				properties = <DgridProperties> {}
			} = options;
			options.properties = properties;

			const events = properties.events = new Evented();

			events.on('dgrid-sort', (event: SortEvent) => {
				const {
					sort
				} = properties;

				const target = event.target;
				const field = (target.getAttribute('field') || target.getAttribute('columnId'));
				const currentSort = (sort && sort[0]);
				let newSort: Sort[] = [{
					property: field,
					descending: (currentSort && currentSort.property === field && !currentSort.descending)
				}];
				properties.sort = newSort;
				instance.invalidate();
			});
		}
	});

export default createDgrid;
