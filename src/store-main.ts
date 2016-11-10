import createObservableStoreMixin from 'dojo-stores/store/mixins/createObservableStoreMixin';
import createStore from 'dojo-stores/store/createStore';
import { default as createMaquetteGrid } from './maquette/createGrid';
import Dgrid, { Column } from './Dgrid';
import { h, VNode } from 'maquette';

interface Person {
	age: number;
	gender: string;
	id: string;
	location: string;
}

const locations = [
	'Dive Bar',
	'Playground',
	'Early Bird Supper',
	'On the Lam',
	'Lost',
	'070-mark-63'
];

function createData(count: number): Person[] {
	const data: Person[] = [];

	for (let i = 0; i < count; i++) {
		data.push({
			id: String(i + 1),
			age: Math.floor(Math.random() * 100) + 1,
			gender: String.fromCharCode(Math.floor(Math.random() * 25) + 65),
			location: locations[Math.floor(Math.random() * locations.length)]
		});
	}

	return data;
}

console.time('createData');
const data = createData(5000);
console.timeEnd('createData');
console.time('createStore');
const store = createStore.mixin(createObservableStoreMixin())(({
	data: data
}));
console.timeEnd('createStore');

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
		},
		{
			id: 'delete',
			field: '',
			label: ''
		}
	]
	// collection: data
};

let grid = createMaquetteGrid(gridNode, props);
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
		else if (column.id === 'delete') {
			children.push('🗑');
		}
		view.render = h('span', children);
		return view;
	}
};

console.time('set grid.store');
grid.store = store;
console.timeEnd('set grid.store');
console.time('grid.startup');
grid.startup();
console.timeEnd('grid.startup');

(<any> window).store = store;
(<any> window).grid = grid;
