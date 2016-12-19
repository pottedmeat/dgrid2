import createProjector, { Projector } from 'dojo-widgets/createProjector';
import { w } from 'dojo-widgets/d';
import createDgrid, { ColumnState } from './createDgrid';
import createCellView from './nodes/createCellView';
import createObservableStoreMixin from 'dojo-stores/store/mixins/createObservableStoreMixin';
import createQueryMixin from 'dojo-stores/store/mixins/createQueryMixin';
import createSubcollectionStore from 'dojo-stores/store/createSubcollectionStore';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';

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

const data = createData(50);
const store = createSubcollectionStore.mixin(createQueryMixin()).mixin(createObservableStoreMixin())(({
	data: data,
	idProperty: 'uuid'
}));

const createCustomDgrid = createDgrid.mixin({
	initialize(instance) {
		instance.registry.define('dgrid-cell-view', createCellView.after('getChildrenNodes', function (this: Widget<WidgetState & ColumnState>, children: string[]) {
			const {
				column
			} = this.state;

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

const createApp = createProjector.mixin({
	mixin: {
		getChildrenNodes: function(this: Projector): any {
			return [
				w(createCustomDgrid, <any> {
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
