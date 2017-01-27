import { createQueryStore } from '@dojo/stores/store/mixins/createQueryTransformMixin';
import createProjectorMixin from '@dojo/widget-core/mixins/createProjectorMixin';
import createWidgetBase from '@dojo/widget-core/createWidgetBase';
import uuid from '@dojo/core/uuid';
import createCustomCell from './createCustomCell';

import createDgrid from '../createDgrid';
import createArrayDataProvider from '../createArrayDataProvider';
import { assign } from '@dojo/core/lang';

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

const paginatedDataProvider = createArrayDataProvider({
	items: data,
	properties: {
		columns: columns,
		pagination: {
			itemsPerPage: 25
		}
	}
});

const paginatedGrid = createDgrid.mixin(createProjectorMixin)({
	properties: assign({
		columns
	}, paginatedDataProvider.properties)
});

const dataProvider = createArrayDataProvider({
	items: data,
	properties: {
		columns: columns
	}
});

const dgrid = createDgrid.mixin(createProjectorMixin)({
	properties: assign({
		columns
	}, dataProvider.properties)
});

dgrid.append();
paginatedGrid.append();