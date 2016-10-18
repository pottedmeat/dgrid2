import Scaffolding from './Scaffolding';
import Customize from './interfaces/Customize';
import Renderer from './interfaces/Renderer';
import on from 'dojo-core/on';
import Evented from 'dojo-core/Evented';

export interface Column {
	id: string;
	label: string;
	field?: string;
}

export interface DgridProperties {
	columns: Column[];
	collection: any[];
}

class Dgrid extends Evented {
	state: {[key: string]: any};
	props: DgridProperties;
	domNode: HTMLElement;
	renderer: Renderer;
	customize: Customize;
	scaffolding: Scaffolding;

	reloadData(at: { row?: number, column?: string }) {
		if ('row' in at) {
			this.scaffolding.reloadPath(this, 'renderer.rowForGrid', [this.props.collection[at.row]]);
		}
	}

	constructor (domNode: HTMLElement, props: DgridProperties) {
		super();

		this.props = props;
		this.domNode = domNode;
		this.state = {};
		const scaffolding = this.scaffolding = new Scaffolding();

		scaffolding.shouldReloadParent = 'renderer.shouldReloadParent';
		scaffolding.add('renderer.viewForGrid');
		scaffolding.add('renderer.headerForGrid', {
			parent: 'renderer.viewForGrid'
		});
		scaffolding.add('headerViewForGrid', {
			parent: 'renderer.headerForGrid',
			groupChildren: true
		});
		scaffolding.add('renderer.headerCellForGrid', {
			parent: 'headerViewForGrid',
			across: 'props.columns'
		});
		scaffolding.add('headerCellViewForGrid', {
			parent: 'renderer.headerCellForGrid'
		});
		scaffolding.add('renderer.bodyForGrid', {
			parent: 'renderer.viewForGrid',
			groupChildren: true
		});
		scaffolding.add('renderer.rowForGrid', {
			parent: 'renderer.bodyForGrid',
			over: 'props.collection'
		});
		scaffolding.add('rowViewForGrid', {
			parent: 'renderer.rowForGrid',
			groupChildren: true
		});
		scaffolding.add('renderer.cellForGrid', {
			parent: 'rowViewForGrid',
			across: 'props.columns'
		});
		scaffolding.add('cellViewForGrid', {
			parent: 'renderer.cellForGrid'
		});
	}

	headerViewForGrid(grid: Dgrid, children: any[], view?: any) {
		const cells: { [key: string]: any } = {},
			columns = this.props.columns;
		for (let i = 0, il = columns.length; i < il; i++) {
			cells[columns[i].id] = children[i];
		}
		if (this.customize && this.customize.headerViewForGrid) {
			return this.customize.headerViewForGrid(grid, columns, cells, view);
		}
		return this.renderer.headerViewForGrid(grid, columns, cells, view);
	}

	headerCellViewForGrid(grid: Dgrid, column: Column, view?: any) {
		if (this.customize && this.customize.headerCellViewForGrid) {
			return this.customize.headerCellViewForGrid(grid, column, view);
		}
		return this.renderer.headerCellViewForGrid(grid, column, view);
	}

	rowViewForGrid(grid: Dgrid, data: any, children: any[], view?: any) {
		const cells: { [key: string]: any } = {},
			columns = this.props.columns;
		for (let i = 0, il = columns.length; i < il; i++) {
			cells[columns[i].id] = children[i];
		}
		if (this.customize && this.customize.rowViewForGrid) {
			return this.customize.rowViewForGrid(grid, data, columns, cells, view);
		}
		return this.renderer.rowViewForGrid(grid, data, columns, cells, view);
	}

	cellViewForGrid(grid: Dgrid, data: any, column: Column, view?: any) {
		if (this.customize && this.customize.cellViewForGrid) {
			return this.customize.cellViewForGrid(grid, data, column, view);
		}
		return this.renderer.cellViewForGrid(grid, data, column, view);
	}

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

		on(this, 'thead:click', (event: MouseEvent) => {
			state['theadFocused'] = !state['theadFocused'];
			console.log('thead focused:', state['theadFocused']);
			scaffolding.reloadAt(this, 'headerViewForGrid');
		});
		on(this, 'tbody:click', (event: MouseEvent) => {
			state['tbodyFocused'] = !state['tbodyFocused'];
			console.log('tbody focused:', state['tbodyFocused']);
			scaffolding.reloadAt(this, 'renderer.bodyForGrid');
		});
	}
}

export default Dgrid;
