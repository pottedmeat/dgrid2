import _Renderer from '../interfaces/Renderer';
import Dgrid, { Column } from '../Dgrid';
import on, { emit } from 'dojo-core/on';

class Renderer implements _Renderer {
	domNode: HTMLElement;

	shouldReloadParent(oldRender: HTMLElement, newRender: HTMLElement) {
		if (oldRender.parentNode) {
			oldRender.parentNode.replaceChild(newRender, oldRender);
			return false;
		}
		return true;
	}

	viewForGrid(grid: Dgrid, header: HTMLElement, body: HTMLElement, view?: {domNode: HTMLElement}) {
		if (view) {
			return view;
		}
		this.domNode = document.createElement('div');
		const table = document.createElement('table');
		table.classList.add('dom');
		table.appendChild(header);
		table.appendChild(body);
		this.domNode.appendChild(table);
		return {
			domNode: this.domNode
		};
	}

	headerForGrid(grid: Dgrid, content: HTMLElement, view?: { render: HTMLElement }) {
		return {
			render: content
		};
	}

	headerViewForGrid(grid: Dgrid, columns: Column[], cells: { [key: string]: HTMLElement }, view?: {thead: HTMLElement, render: HTMLElement}) {
		let thead: HTMLElement;
		if (view) {
			thead = view.thead;
		}
		else {
			thead = document.createElement('thead');
			on(thead, 'click', () => {
				emit(grid, {
					type: 'thead:click'
				});
			});
			view = {
				thead: thead,
				render: thead
			};
		}

		thead.innerHTML = '';
		for (let column of columns) {
			thead.appendChild(cells[column.id]);
		}

		const state = grid.state;
		if (state['theadFocused']) {
			thead.classList.add('thead-focused');
		}
		else {
			thead.classList.remove('thead-focused');
		}

		return view;
	}

	headerCellForGrid(grid: Dgrid, column: Column, content: HTMLElement, view?: { th: HTMLElement, render: HTMLElement }) {
		let th: HTMLElement;
		if (view) {
			th = view.th;
		}
		else {
			th = document.createElement('th');
			th.className = 'dgrid-column-' + column.id;
			view = {
				th: th,
				render: th
			};
		}

		th.innerHTML = '';
		th.appendChild(content);

		return view;
	}

	headerCellViewForGrid?(grid: Dgrid, column: Column, view?: { render: HTMLElement }) {
		return {
			render: document.createTextNode(column.label)
		};
	}

	bodyForGrid(grid: Dgrid, rows: HTMLElement[], view?: { tbody: HTMLElement, classesNode: HTMLElement, render: HTMLElement }) {
		let tbody: HTMLElement;
		if (view) {
			tbody = view.tbody;
		}
		else {
			tbody = document.createElement('tbody');
			on(tbody, 'click', () => {
				emit(grid, {
					type: 'tbody:click'
				});
			});
			view = {
				tbody: tbody,
				classesNode: tbody,
				render: tbody
			};
		}

		tbody.innerHTML = '';
		for (let row of rows) {
			tbody.appendChild(row);
		}

		const state = grid.state;
		if (state['tbodyFocused']) {
			view.classesNode.classList.add('tbody-focused');
		}
		else {
			view.classesNode.classList.remove('tbody-focused');
		}
		return view;
	}

	rowForGrid(grid: Dgrid, data: any, content: HTMLElement, view?: { render: HTMLElement }) {
		view = (view || { render: null });
		view.render = content;
		return view;
	}

	rowViewForGrid(grid: Dgrid, data: any, columns: Column[], cells: { [key: string]: HTMLElement }, view?: { tr: HTMLElement, render: HTMLElement }) {
		let tr: HTMLElement;
		if (view) {
			tr = view.tr;
		}
		else {
			tr = document.createElement('tr');
			view = {
				tr: tr,
				render: tr
			};
		}

		// TODO: Replace with as little DOM manipulation as possible
		tr.innerHTML = '';
		for (let column of columns) {
			tr.appendChild(cells[column.id]);
		}

		return view;
	}

	cellForGrid(grid: Dgrid, data: any, column: Column, content: HTMLElement, view?: { td: HTMLElement, render: HTMLElement }) {
		let td: HTMLElement;
		if (view) {
			td = view.td;
		}
		else {
			td = document.createElement('td');
			td.className = 'dgrid-column-' + column.id;
			view = {
				td: td,
				render: td
			};
		}

		// TODO: Replace with as little DOM manipulation as possible
		td.innerHTML = '';
		td.appendChild(content);

		return view;
	}

	cellViewForGrid(grid: Dgrid, data: any, column: Column, view?: { render: Text }) {
		console.log('cell:', data.id, column.id);
		view = (view || { render: null });
		view.render = document.createTextNode(data[column.field]);
		return view;
	}
}

export default Renderer;
