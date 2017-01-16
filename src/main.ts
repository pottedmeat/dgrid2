import createProjector, { Projector } from 'dojo-widgets/createProjector';
import { v, w } from 'dojo-widgets/d';
import createDgrid from './createDgrid';
import storeMixin from './mixins/storeMixin';
import createCellView from './nodes/createCellView';
import createInMemoryStorage from 'dojo-stores/storage/createInMemoryStorage';
import { createQueryStore } from 'dojo-stores/store/mixins/createQueryTransformMixin';

interface Person {
	age: number;
	gender: string;
	uuid: string;
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
			uuid: String(i + 1),
			age: Math.floor(Math.random() * 100) + 1,
			gender: String.fromCharCode(Math.floor(Math.random() * 25) + 65),
			location: locations[Math.floor(Math.random() * locations.length)]
		});
	}

	return data;
}

const data = createData(250);
const storage = createInMemoryStorage({
	idProperty: 'uuid'
});
const store = createQueryStore({
	storage: storage,
	data: data
});

const createCustomDgrid = createDgrid.mixin({
	initialize(instance) {
		instance.registry.define('dgrid-cell-view', createCellView.after('getChildrenNodes', function (children: string[]) {
			const {
				column
			} = this.properties;

			if (column.id === 'age') {
				children.push(' years old');
			}
			else if (column.id === 'gender') {
				children.unshift('is a ');
			}
			else if (column.id === 'location') {
				children.unshift('located at ');
			}
			else if (column.id === 'delete') {
				children.push('🗑');
			}

			return children;
		}));
	}
});

const columns = [
	{
		id: 'age',
		field: 'age',
		label: 'Age',
		sortable: true
	},
	{
		id: 'gender',
		field: 'gender',
		label: 'Gender',
		sortable: true
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
];

const createApp = createProjector.mixin({
	mixin: {
		getChildrenNodes: function(this: Projector): any {
			return [
				v('h1', [ 'Array-Driven Grid' ]),
				w(createCustomDgrid, <any> {
					id: 'grid-data',
					columns,
					data,
					idProperty: 'uuid',
					sort: [ { property: 'age', descending: true }, { property: 'gender' } ]
				}),
				v('h1', [ 'Store-Driven Grid' ]),
				w(createCustomDgrid.mixin(storeMixin), {
					id: 'grid-store',
					columns,
					collection: store,
					sort: [ { property: 'age' }, { property: 'gender', descending: true } ]
				})
			];
		}
	}
});

const app = createApp();

app.append().then(() => {
	console.log('grid attached');
});
