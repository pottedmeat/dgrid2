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
			label: 'Age'
		},
		{
			id: 'gender',
			label: 'Gender'
		},
		{
			id: 'location',
			label: 'Location'
		}
	]
};
let grid: Dgrid;
if (type === 'dom') {
	grid = createDOMGrid(div, props);
	grid.customize = {
		headerCellForGrid: function(grid: Dgrid, column: Column, view?: { render: HTMLElement }) {
			const span = document.createElement('span');
			span.className = 'my';
			span.innerHTML = column.label;
			return {
				render: span
			};
		}
	};
}
else if (type === 'maquette') {
	grid = createMaquetteGrid(div, props);
	grid.customize = {
		headerCellForGrid: function(grid: Dgrid, column: Column, view?: { render: VNode }) {
			return {
				render: h('span.my', [column.label])
			};
		}
	};
}
grid.startup();