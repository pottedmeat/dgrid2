import createProjectorMixin from '@dojo/widget-core/mixins/createProjectorMixin';
import uuid from '@dojo/core/uuid';
import createDgrid from '../createDgrid';
import createArrayDataProvider from '../createArrayDataProvider';

const locations = [
	'Dive Bar',
	'Playground',
	'Early Bird Supper',
	'On the Lam',
	'Lost',
	'070-mark-63',
	'Fun Fair',
	'Bus Stop',
	'Las Vegas',
	'New York, New York',
	'Farm',
	'Scotland'
];

function createData(count: number): any[] {
	const data: any[] = [];

	for (let i = 0; i < count; i++) {
		data.push({
			id: uuid(),
			age: Math.floor(Math.random() * 100) + 1,
			gender: String.fromCharCode(Math.floor(Math.random() * 25) + 65),
			location: locations[Math.floor(Math.random() * locations.length)],
			color: 'transparent'
		});
	}

	return data;
};

let data = createData(250);

const columns = [
	{
		id: 'age',
		field: 'age',
		label: 'Age',
		sortable: true,
		renderer: function (value: string) {
			return value + ' years old';
		}
	},
	{
		id: 'gender',
		field: 'gender',
		label: 'Gender',
		sortable: true,
		renderer: function (value: string) {
			return 'is a ' + value;
		}
	},
	{
		id: 'location',
		field: 'location',
		label: 'Location',
		renderer: function (value: string) {
			return 'located at ' + value;
		}
	},
	{
		id: 'delete',
		field: '',
		label: '',
		renderer: function (value: string) {
			return '🗑';
		}
	}
];

const dgrid = createDgrid.mixin(createProjectorMixin)(createArrayDataProvider({
	items: data,
	properties: {
		columns: columns
	}
}));

const paginatedGrid = createDgrid.mixin(createProjectorMixin)(createArrayDataProvider({
	items: data,
	properties: {
		columns: columns,
		pagination: {
			itemsPerPage: 25
		}
	}
}));

dgrid.append();
paginatedGrid.append();
