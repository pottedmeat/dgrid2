import _Renderer from '../interfaces/Renderer';
import { createProjector, Projector, h, VNode } from 'maquette';
import Dgrid, { Column } from '../Dgrid';
// import { emit } from 'dojo-core/on';

let viewForGridChildren: {
	header: VNode,
	body: VNode,
	renderMaquette: () => VNode
} = {
	header: null,
	body: null,
	renderMaquette: function() {
		return h('div.dgrid-maquette.dgrid.dgrid-grid', {
			role: 'grid'
		}, [this.header, this.body]);
	}
};

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

	headerForGrid(grid: Dgrid, content: VNode, scrollbarWidth: number, view?: { render: VNode[] }) {
		view = (view || { render: null });
		view.render = [
			h('div.dgrid-header.dgrid-header-row', {
				role: 'row',
				style: 'right:' + scrollbarWidth + 'px'
			}, content),
			h('div.dgrid-header.dgrid-header-scroll.dgrid-scrollbar-width', {
				style: 'width:' + scrollbarWidth + 'px'
			})
		];
		return view;
	}

	headerViewForGrid(grid: Dgrid, columns: Column[], cells: { [key: string]: VNode }, view?: {render: VNode}) {
		const children: VNode[] = [];
		for (let column of columns) {
			children.push(cells[column.id]);
		}

		view = (view || { render: null });
		view.render = h('table.dgrid-row-table', {
			role: 'presentation'
		}, [ h('tr', children) ]);
		return view;
	}

	headerCellForGrid(grid: Dgrid, column: Column, content: VNode, view?: { render: VNode }) {
		view = (view || { render: null });
		const classes = ['dgrid-cell'];
		if (column.id) {
			classes.push('dgrid-column-' + column.id);
		}
		if (column.field) {
			classes.push('dgrid-field-' + column.field);
		}
		view.render = h('th.' + classes.join('.'), {
			role: 'columnheader'
		}, [ content ]);
		return view;
	}

	headerCellViewForGrid?(grid: Dgrid, column: Column, view?: { render: string }) {
		view = (view || { render: null });
		view.render = column.label;
		return view;
	}

	bodyForGrid(grid: Dgrid, rows: VNode[], view?: {render: VNode}) {
		view = (view || { render: null });
		view.render = h('div.dgrid-scroller', [
			h('div.dgrid-content', rows)
		]);
		return view;
	}

	rowForGrid(grid: Dgrid, data: any, content: VNode, view?: { render: VNode }) {
		view = (view || { render: null });
		view.render = h('div.dgrid-row', {
			role: 'row',
			key: grid.store.identify(data)[0]
		}, content);
		return view;
	}

	rowViewForGrid(grid: Dgrid, data: any, columns: Column[], cells: { [key: string]: VNode }, view?: { render: VNode }) {
		const children: VNode[] = [];
		for (let column of columns) {
			children.push(cells[column.id]);
		}

		view = (view || { render: null });
		view.render = h('table.dgrid-row-table', {
			role: 'presentation'
		}, [ h('tr', children) ]);
		return view;
	}

	cellForGrid(grid: Dgrid, data: any, column: Column, content: VNode, view?: { render: VNode }) {
		view = (view || { render: null });
		const classes = ['dgrid-cell'];
		if (column.id) {
			classes.push('dgrid-column-' + column.id);
		}
		if (column.field) {
			classes.push('dgrid-field-' + column.field);
		}
		view.render = h('td.' + classes.join('.'), {
			role: 'gridcell'
		}, content);
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
