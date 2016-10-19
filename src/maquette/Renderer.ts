import _Renderer from '../interfaces/Renderer';
import { createProjector, Projector, h, VNode } from 'maquette';
import Dgrid, { Column } from '../Dgrid';
import { emit } from 'dojo-core/on';

let viewForGridChildren: {
	header: VNode,
	body: VNode,
	renderMaquette: () => VNode
} = {
	header: null,
	body: null,
	renderMaquette: function() {
		return h('table.maquette', [this.header, this.body]);
	}
};

let emitTbodyClick: (event: MouseEvent) => void;
let emitTheadClick: (event: MouseEvent) => void;

class Renderer implements _Renderer {
	projector: Projector;
	domNode: HTMLElement;

	shouldReloadParent(oldRender: VNode, newRender: VNode) {
		return true;
	}

	viewForGrid(grid: Dgrid, header: VNode, body: VNode, view?: {domNode: HTMLElement}) {
		viewForGridChildren.header = header;
		viewForGridChildren.body = body;
		if (view) {
			this.projector.scheduleRender();
			return view;
		}
		if (!this.domNode) {
			this.domNode = document.createElement('div');
		}
		if (!this.projector) {
			this.projector = createProjector({});
		}
		this.projector.append(this.domNode, function() {
			return viewForGridChildren.renderMaquette();
		});
		return {
			domNode: this.domNode
		};
	}

	headerForGrid(grid: Dgrid, content: VNode, view?: { render: VNode }) {
		view = (view || { render: null });
		view.render = content;
		return view;
	}

	headerViewForGrid(grid: Dgrid, columns: Column[], cells: { [key: string]: VNode }, view?: {render: VNode}) {
		const state = grid.state;

		if (!emitTheadClick) {
			emitTheadClick = function () {
				emit(grid, {
					type: 'thead:click'
				});
			};
		}

		const children: VNode[] = [];
		for (let column of columns) {
			children.push(cells[column.id]);
		}

		view = (view || { render: null });
		view.render = h('thead', {
			onclick: emitTheadClick,
			classes: {
				'thead-focused': state['theadFocused']
			}
		}, children);
		return view;
	}

	headerCellForGrid(grid: Dgrid, column: Column, content: VNode, view?: { render: VNode }) {
		view = (view || { render: null });
		view.render = h('th.dgrid-column-' + column.id, [ content ]);
		return view;
	}

	headerCellViewForGrid?(grid: Dgrid, column: Column, view?: { render: string }) {
		view = (view || { render: null });
		view.render = column.label;
		return view;
	}

	bodyForGrid(grid: Dgrid, rows: VNode[], view?: {render: VNode}) {
		const state = grid.state;

		if (!emitTbodyClick) {
			emitTbodyClick = function () {
				emit(grid, {
					type: 'tbody:click'
				});
			};
		}

		view = (view || { render: null });
		view.render = h('tbody', {
			onclick: emitTbodyClick,
			classes: {
				'tbody-focused': state['tbodyFocused']
			}
		}, rows);
		return view;
	}

	rowForGrid(grid: Dgrid, data: any, content: VNode, view?: { render: VNode }) {
		view = (view || { render: null });
		view.render = content;
		return view;
	}

	rowViewForGrid(grid: Dgrid, data: any, columns: Column[], cells: { [key: string]: VNode }, view?: { render: VNode }) {
		const children: VNode[] = [];
		for (let column of columns) {
			children.push(cells[column.id]);
		}

		view = (view || { render: null });
		view.render = h('tr', {
			key: data.id
		}, children);
		return view;
	}

	cellForGrid(grid: Dgrid, data: any, column: Column, content: VNode, view?: { render: VNode }) {
		view = (view || { render: null });
		view.render = h('td.dgrid-column-' + column.id, {
			key: column.id
		}, [ content ]);
		return view;
	}

	cellViewForGrid(grid: Dgrid, data: any, column: Column, view?: { render: string }) {
		console.log('cell:', data.id, column.id);
		view = (view || { render: null });
		view.render = data[column.field];
		return view;
	}
}

export default Renderer;
