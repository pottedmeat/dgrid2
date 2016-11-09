import { default as createMaquetteGrid } from './maquette/createGrid';
import Dgrid, { Column } from './Dgrid';
import { h, VNode } from 'maquette';

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
	]
};
let grid = createMaquetteGrid(div, props);
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
grid.startup();

console.log('Updating record 2');
props.collection[1].age = 1;
props.collection[1].gender = 'F';
props.collection[1].location = 'Home';
grid.reloadData({ row: 1 });

console.log('Removing record 3');
props.collection.length = 2;
grid.reloadData();

console.log('Adding record 4');
props.collection.push({
	id: 4,
	age: 45,
	gender: 'M',
	location: 'Porsche Dealership'
});
grid.reloadData();
