import createObservableStoreMixin from 'dojo-stores/store/mixins/createObservableStoreMixin';
import createStore from 'dojo-stores/store/createStore';
import { default as createDOMGrid } from './dom/createGrid';
import { default as createMaquetteGrid } from './maquette/createGrid';
import Dgrid, { Column } from './Dgrid';
import { h, VNode } from 'maquette';

interface Person {
	age: number;
	gender: string;
	id: number;
	location: string;
}

const data: Person[] = [
	{
		id: 1,
		age: 21,
		gender: 'M',
		location: 'Dive Bar'
	},
	{
		id: 2,
		age: 8,
		gender: 'M',
		location: 'Playground'
	},
	{
		id: 3,
		age: 70,
		gender: 'F',
		location: 'Early Bird Supper'
	}
];
const store = createStore.mixin(createObservableStoreMixin())(({
	data: data
}));
const type = 'maquette';

const gridNode = document.getElementById('grid');

const props = {
	columns: [
		{
			id: 'age',
			field: 'age',
			label: 'Age'
		},
		{
			id: 'gender',
			field: 'gender',
			label: 'Gender'
		},
		{
			id: 'location',
			field: 'location',
			label: 'Location'
		}
	]
	// collection: data
};
let grid: Dgrid;
if (type === 'dom') {
	grid = createDOMGrid(gridNode, props);
	grid.customize = {
		headerCellViewForGrid(grid: Dgrid, column: Column, view?: { text: HTMLElement, render: HTMLElement }) {
			if (view) {
				view.text.innerHTML = column.label;
				return view;
			}

			const span = document.createElement('span');
			span.className = 'my';
			span.innerHTML = column.label;
			return {
				text: span,
				render: span
			};
		},
		cellViewForGrid(grid: Dgrid, data: any, column: Column, view: { content: HTMLElement, render: HTMLElement }) {
			let content: HTMLElement;
			if (view || (view = grid.viewWithIdentifier(column.id))) {
				content = view.content;
			}
			else {
				const render = document.createElement('span');
				content = document.createElement('span');
				const span = document.createElement('span');
				if (column.id === 'age') {
					span.innerHTML = ' years old';
					render.appendChild(content);
					render.appendChild(span);
				}
				else if (column.id === 'gender') {
					span.innerHTML = 'is a ';
					render.appendChild(span);
					render.appendChild(content);
				}
				else if (column.id === 'location') {
					span.innerHTML = 'located at ';
					render.appendChild(span);
					render.appendChild(content);
				}
				view = {
					content: content,
					render: render
				};
				grid.registerView(view, column.id);
			}

			content.innerHTML = data[column.field];

			return view;
		}
	};
}
else if (type === 'maquette') {
	grid = createMaquetteGrid(gridNode, props);
	grid.customize = {
		headerCellViewForGrid: function(grid: Dgrid, column: Column, view?: { render: VNode }) {
			view = (view || { render: null });
			view.render = h('span.my', [column.label]);
			return view;
		},
		cellViewForGrid(grid: Dgrid, data: any, column: Column, view: { render: VNode }) {
			view = (view || { render: null });
			const content = data[column.field];
			const children: string[] = [];
			if (column.id === 'age') {
				children.push(content, ' years old');
			}
			else if (column.id === 'gender') {
				children.push('is a ', content);
			}
			else if (column.id === 'location') {
				children.push('located at ', content);
			}
			view.render = h('span', children);
			return view;
		}
	};
}

grid.store = store;
grid.startup();

(<any> window).store = store;
(<any> window).grid = grid;
