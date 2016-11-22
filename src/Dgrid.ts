import compose from 'dojo-compose/compose';
import Scaffolding from './Scaffolding';
import Customize from './interfaces/Customize';
import Renderer from './interfaces/Renderer';
import View from './interfaces/View';
import on from 'dojo-core/on';
import createEvented from 'dojo-compose/mixins/createEvented';
import Evented from 'dojo-core/Evented';
import has, { add as addHas } from 'dojo-has/has';
import { CrudOptions, Store } from 'dojo-stores/store/createStore';
import { ObservableStoreMixin } from 'dojo-stores/store/mixins/createObservableStoreMixin';
import { createSort } from 'dojo-stores/query/Sort';
import { QueryMixin} from 'dojo-stores/store/mixins/createQueryMixin';
import { UpdateResults } from 'dojo-stores/storage/createInMemoryStorage';
import { Subscription } from 'rxjs/Rx';

export interface Column {
	id: string;
	label: string;
	field?: string;
	sortable?: boolean;
}

// TODO: this is not a great solution
export function isColumn(object: any): object is Column {
	return 'id' in object && 'label' in object;
}

export interface Sort {
	property: string;
	descending: boolean;
}

export interface SortTarget extends HTMLElement {
	sortable: boolean;
	field: string;
	columnId: string;
}

export interface SortEvent {
	type: string;
	grid: Dgrid;
	event: (MouseEvent | KeyboardEvent);
	target: SortTarget;
}

export interface DgridProperties {
	domNode: HTMLElement;
	columns: Column[];
	collection?: any[];
	id?: string;
	idProperty?: string;
	store?: Store<any, CrudOptions, UpdateResults<any>>;
}

type ObservableStore = Store<any, CrudOptions, UpdateResults<any>> & ObservableStoreMixin<any>;

let autoId = 0;
let scrollbarWidth = 0;

function cleanupTestElement(element: HTMLElement) {
	element.className = '';
	if (element.parentNode) {
		document.body.removeChild(element);
	}
}

function generateId(): string {
	return 'dgrid_' + String(autoId++);
}

function getScrollbarSize(element: HTMLElement, dimension: string) {
	// Used by has tests for scrollbar width/height
	element.className = 'dgrid-scrollbar-measure';
	document.body.appendChild(element);
	const offset: number = (<any> element)['offset' + dimension];
	const client: number = (<any> element)['client' + dimension];
	let size: number = (offset - client);
	cleanupTestElement(element);
	if (false && has('ie')) {
		// Avoid issues with certain widgets inside in IE7, and
		// ColumnSet scroll issues with all supported IE versions
		size++;
	}
	return size;
}
addHas('dom-scrollbar-width', function () {
	return getScrollbarSize(document.createElement('div'), 'Width');
});
addHas('dom-scrollbar-height', function () {
	return getScrollbarSize(document.createElement('div'), 'Height');
});

interface Dgrid {
	// TODO: this seems like a legitimate use of any, but should/can this be generic?
	store: Store<any, CrudOptions, UpdateResults<any>>;
	_store: Store<any, CrudOptions, UpdateResults<any>>;
	_storeSubscription: Subscription;
	id: string;
	idProperty: string;
	state: {[key: string]: any};
	options: DgridProperties;
	domNode: HTMLElement;
	renderer: Renderer;
	customize: Customize;
	scaffolding: Scaffolding<any>;
	sort: Sort[];
}

export const createDgrid = compose(<Dgrid> {
	_store: null,
	_storeSubscription: null,
	id: '',
	idProperty: 'id',
	state: null,
	options: null,
	domNode: null,
	renderer: null,
	customize: null,
	scaffolding: null,
	sort: null
}, function (instance: Dgrid, options: DgridProperties) {
	instance.options = options;
	instance.id = options.domNode.id || options.id || generateId();
	options.domNode.id = instance.id;
}).extend({
	get store(): any {
		return this._store;
	},

	set store(newStore: any) {
		if (this._store === newStore) {
			return;
		}

		if (this._storeSubscription) {
			this._storeSubscription.unsubscribe();
			this._storeSubscription = null;
		}

		this._store = newStore;

		this._updateCollectionFromStore();

		if ((<ObservableStore> this._store).observe) {
			this._storeSubscription = (<ObservableStore> this._store).observe().subscribe(() => {
				this._updateCollectionFromStore();
			});
		}
	},

	_generateRowId(objectId: string): string {
		return this.id + '-row-' + objectId;
	},

	_updateCollectionFromStore() {
		console.time('store.fetch');
		this._store.fetch().then((data: any[]) => {
			console.timeEnd('store.fetch');
			this.options.collection = data;
			console.time('scaffolding.reloadAt');
			this.scaffolding.reloadAt(this, 'body');
			console.timeEnd('scaffolding.reloadAt');
		});
	},

	reloadData(at?: { row?: number, column?: string }) {
		let column: Column;
		if (!at) {
			this.scaffolding.reloadPath(this, 'body');
		}
		else {
			if ('column' in at) {
				for (let possible of this.options.columns) {
					if (possible.id === at.column) {
						column = possible;
						break;
					}
				}
			}
			if ('row' in at && 'column' in at) {
				this.scaffolding.reloadPath(this, 'row', [this.options.collection[at.row], column]);
			}
			else if ('row' in at) {
				this.scaffolding.reloadPath(this, 'row', [this.options.collection[at.row]]);
			}
			else if ('column' in at) {
				// should this be done?
			}
		}
	},

	registerView (view: View<any>, identifier: string) {
		this.scaffolding.registerView(view, identifier);
	},

	/**
	 * Get the row node for an object id or DOM node.
	 *
	 * @param target If a string is specified, it must be the id of a data object.
	 * 		If a node is specified, it must be a row node, or descendant of a row node.
	 * @returns The row node, or undefined if it does not exist.
	 */
	row (target: string | HTMLElement): HTMLElement {
		let row = <HTMLElement> target;

		if (row instanceof HTMLElement) {
			if (!this.domNode.contains(row)) {
				return;
			}

			while (!(<any> row).dgridData && row.parentElement && row !== this.domNode) {
				row = row.parentElement;
			}
		}
		else if (typeof target === 'string') {
			row = document.getElementById(this._generateRowId(target));
		}

		return row;
	},

	viewWithIdentifier (identifier: string): any {
		return this.scaffolding.viewWithIdentifier(identifier);
	},

	shouldReloadParent(oldRender: any, newRender: any) {
		return this.renderer.shouldReloadParent(oldRender, newRender);
	},

	_view(grid: Dgrid, header: any, body: any, view?: any) {
		return this.renderer.viewForGrid(grid, header, body, view);
	},

	_header(grid: Dgrid, content: any, view?: any) {
		if (!scrollbarWidth) {
			// Measure the browser's scrollbar width using a DIV we'll delete right away
			scrollbarWidth = <number> has('dom-scrollbar-width');
		}
		return this.renderer.headerForGrid(grid, content, scrollbarWidth, view);
	},

	_headerView(grid: Dgrid, children: any[], view?: any) {
		const cells: { [key: string]: any } = {},
			columns = this.options.columns;
		for (let i = 0, il = columns.length; i < il; i++) {
			cells[columns[i].id] = children[i];
		}
		if (this.customize && this.customize.headerViewForGrid) {
			return this.customize.headerViewForGrid(grid, columns, cells, view);
		}
		return this.renderer.headerViewForGrid(grid, columns, cells, view);
	},

	_headerCell(grid: Dgrid, column: Column, content: any, view?: any) {
		return this.renderer.headerCellForGrid(grid, column, content, view);
	},

	_headerCellView(grid: Dgrid, column: Column, view?: any) {
		if (this.customize && this.customize.headerCellViewForGrid) {
			return this.customize.headerCellViewForGrid(grid, column, view);
		}
		return this.renderer.headerCellViewForGrid(grid, column, view);
	},

	_body(grid: Dgrid, rows: any[], view?: any) {
		return this.renderer.bodyForGrid(grid, rows, view);
	},

	_row(grid: Dgrid, data: any, content: any, view?: any) {
		return this.renderer.rowForGrid(grid, data, content, view);
	},

	_rowView(grid: Dgrid, data: any, children: any[], view?: any) {
		const cells: { [key: string]: any } = {},
			columns = this.options.columns;
		for (let i = 0, il = columns.length; i < il; i++) {
			cells[columns[i].id] = children[i];
		}
		if (this.customize && this.customize.rowViewForGrid) {
			return this.customize.rowViewForGrid(grid, data, columns, cells, view);
		}
		return this.renderer.rowViewForGrid(grid, data, columns, cells, view);
	},

	_cell(grid: Dgrid, data: any, column: Column, content: any, view?: any) {
		return this.renderer.cellForGrid(grid, data, column, content, view);
	},

	_cellView(grid: Dgrid, data: any, column: Column, view?: any) {
		if (this.customize && this.customize.cellViewForGrid) {
			return this.customize.cellViewForGrid(grid, data, column, view);
		}
		return this.renderer.cellViewForGrid(grid, data, column, view);
	},

	startup () {
		const scaffolding = this.scaffolding;
		const view = scaffolding.build(this);
		let domNode = this.domNode;
		if (domNode.parentNode) {
			domNode.parentNode.replaceChild(view.domNode, domNode);
			domNode = view.domNode;
			this.domNode = domNode;
		}
		else {
			domNode.appendChild(view.domNode);
		}
		const state = this.state;

		on(this, 'dgrid-sort', (event: SortEvent) => {
			const target = event.target;
			const field = (target.field || target.columnId);
			const sort = (this.sort && this.sort[0]);
			let newSort: Sort[] = [{
				property: field,
				descending: (sort && sort.property === field && !sort.descending)
			}];
			this.sort = newSort;
			if (newSort.length) {
				const sortable = <QueryMixin<any, CrudOptions, UpdateResults<any>, Store<any, CrudOptions, UpdateResults<any>>>> this.store;
				this.store = sortable.sort(newSort[0].property, newSort[0].descending);
				console.timeEnd('store.sort');
			}
		});
	}
}).mixin({
	initialize: function (instance) {
		const options = instance.options;
		instance.domNode = options.domNode;
		instance.state = {};

		// TODO: we need a unified approach on constructor params
		if (options.idProperty) {
			instance.idProperty = options.idProperty;
		}

		if (options.store) {
			instance.store = options.store;
		}

		const scaffolding = instance.scaffolding = new Scaffolding({
			idProperty: instance.idProperty
		});

		scaffolding.shouldReloadParent = instance.shouldReloadParent.bind(instance);
		scaffolding.add({
			id: 'view',
			context: instance,
			callback: instance._view
		});
		scaffolding.add(({
			id: 'header',
			context: instance,
			callback: instance._header,
			parent: 'view'
		}));
		scaffolding.add({
			id: 'headerView',
			context: instance,
			callback: instance._headerView,
			parent: 'header',
			groupChildren: true
		});
		scaffolding.add({
			id: 'headerCell',
			context: instance,
			callback: instance._headerCell,
			parent: 'headerView',
			over: () => {
				return instance.options.columns;
			}
		});
		scaffolding.add({
			id: 'headerCellView',
			context: instance,
			callback: instance._headerCellView,
			parent: 'headerCell'
		});
		scaffolding.add({
			id: 'body',
			context: instance,
			callback: instance._body,
			parent: 'view',
			groupChildren: true
		});
		scaffolding.add({
			id: 'row',
			context: instance,
			callback: instance._row,
			parent: 'body',
			over: () => {
				return instance.options.collection;
			},
			identify: (item: any) => {
				let id: string;

				if (instance._store) {
					id = instance._store.identify(item)[0];
				}
				else {
					id = item[instance.idProperty];
				}

				return id;
			}
		});
		scaffolding.add({
			id: 'rowView',
			context: instance,
			callback: instance._rowView,
			parent: 'row',
			groupChildren: true
		});
		scaffolding.add({
			id: 'cell',
			context: instance,
			callback: instance._cell,
			parent: 'rowView',
			over: () => {
				return instance.options.columns;
			}
		});
		scaffolding.add({
			id: 'cellView',
			context: instance,
			callback: instance._cellView,
			parent: 'cell'
		});
	}
}).mixin(createEvented);

export default Dgrid;
