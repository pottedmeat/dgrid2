import { default as createDOMGrid } from './dom/createGrid';
import { default as createMaquetteGrid } from './maquette/createGrid';
import Dgrid, { Column } from './Dgrid';
import { h, VNode } from 'maquette';

const type = 'maquette';

const div = document.createElement('div');
document.body.appendChild(div);
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
	],
	collection: [
		{
			id: 1,
			age: '21',
			gender: 'M',
			location: 'Dive Bar'
		},
		{
			id: 2,
			age: '8',
			gender: 'M',
			location: 'Playground'
		},
		{
			id: 3,
			age: '70',
			gender: 'F',
			location: 'Early Bird Supper'
		}
	]
};
let grid: Dgrid;
if (type === 'dom') {
	grid = createDOMGrid(div, props);
	grid.customize = {
		headerCellViewForGrid: function(grid: Dgrid, column: Column, view?: { text: HTMLElement, render: HTMLElement }) {
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
		}
	};
}
else if (type === 'maquette') {
	grid = createMaquetteGrid(div, props);
	grid.customize = {
		headerCellViewForGrid: function(grid: Dgrid, column: Column, view?: { render: VNode }) {
			return {
				render: h('span.my', [column.label])
			};
		}
	};
}
grid.startup();
