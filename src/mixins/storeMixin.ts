import { Widget } from 'dojo-widgets/interfaces';
import { DgridProperties, DgridOptions, HasCollection, HasSort } from '../createDgrid';
import { ComposeFactory } from 'dojo-compose/compose';
import createSort from 'dojo-stores/query/createSort';

export default {
	initialize(instance: Widget<DgridProperties>) {
		const registry = instance.registry;
		const body: ComposeFactory<Widget<DgridProperties>, DgridOptions> = <any> registry.get('dgrid-body');
		registry.define('dgrid-body', body.override({
			getData(properties: HasCollection & HasSort) {
				const {
					collection,
					sort
				} = properties;

				if (collection) {
					return (sort && sort.length) ? collection.fetch(createSort(sort[0].property, sort[0].descending)) : collection.fetch();
				}

				return new Promise((resolve) => {
					resolve([]);
				});
			}
		}));
	}
};
