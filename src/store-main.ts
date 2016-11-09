import createObservableStoreMixin from 'dojo-stores/store/mixins/createObservableStoreMixin';
import createStore from 'dojo-stores/store/createStore';
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
		view.render = h('span', children);
		return view;
	}
};

grid.store = store;
grid.startup();

(<any> window).store = store;
(<any> window).grid = grid;
