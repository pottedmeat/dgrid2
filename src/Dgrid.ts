import Scaffolding from './Scaffolding';
import Customize from './interfaces/Customize';
import Renderer from './interfaces/Renderer';
import on from 'dojo-core/on';
import Evented from 'dojo-core/Evented';

export interface Column {
	id: string;
	label: string;
}

export interface DgridProperties {
	columns: Column[];
}

class Dgrid extends Evented {
	state: {[key: string]: any};
	props: DgridProperties;
	domNode: HTMLElement;
	renderer: Renderer;
	customize: Customize;
	scaffolding: Scaffolding;

	constructor (domNode: HTMLElement, props: DgridProperties) {
		super();

		this.props = props;
		this.domNode = domNode;
		this.state = {};
		const scaffolding = this.scaffolding = new Scaffolding();

		scaffolding.add('renderer.viewForGrid');
		scaffolding.add('headerForGrid', {
			parent: 'renderer.viewForGrid',
			on: 'thead:click',
			groupChildren: true
		});
		scaffolding.add('headerCellForGrid', {
			parent: 'headerForGrid',
			across: 'props.columns'
		});
		scaffolding.add('renderer.bodyForGrid', {
			parent: 'renderer.viewForGrid',
			on: 'tbody:click'
		});
	}

	headerForGrid<T>(grid: Dgrid, children: any[], view?: any) {
		const cells: { [key: string]: any } = {},
			columns = this.props.columns;
		for (let i = 0, il = columns.length; i < il; i++) {
			cells[columns[i].id] = children[i];
		}
		return this.renderer.headerForGrid(grid, columns, cells, view);
	}

	headerCellForGrid<T>(grid: Dgrid, column: Column, view?: any) {
		if (this.customize && this.customize.headerCellForGrid) {
			return this.customize.headerCellForGrid(grid, column, view);
		}
		return this.renderer.headerCellForGrid(grid, column, view);
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
			scaffolding.build(this);
		});
		on(this, 'tbody:click', (event: MouseEvent) => {
			state['tbodyFocused'] = !state['tbodyFocused'];
			console.log('tbody focused:', state['tbodyFocused']);
			scaffolding.build(this);
		});
	}
}

export default Dgrid;
