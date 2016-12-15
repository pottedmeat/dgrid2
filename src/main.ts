import createProjector, { Projector } from 'dojo-widgets/createProjector';
import { w } from 'dojo-widgets/d';
import createDgrid from './createDgrid';
import createObservableStoreMixin from 'dojo-stores/store/mixins/createObservableStoreMixin';
import createQueryMixin from 'dojo-stores/store/mixins/createQueryMixin';
import createSubcollectionStore from 'dojo-stores/store/createSubcollectionStore';

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

const data = createData(5000);
const store = createSubcollectionStore.mixin(createQueryMixin()).mixin(createObservableStoreMixin())(({
	data: data,
	idProperty: 'uuid'
}));

const createApp = createProjector.mixin({
	mixin: {
		getChildrenNodes: function(this: Projector): any {
			return [
				w(createDgrid, <any> {
					id: 'grid',
					state: {
						id: 'grid',
						collection: store,
						columns: [
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
						]
					}
				})
			];
		}
	}
});

const app = createApp();

app.append().then(() => {
	console.log('grid attached');
});
