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
					if (sort && sort.length) {
						const keys: string[] = [];
						const descending: boolean[] = [];
						for (const options of sort) {
							keys.push(options.property);
							descending.push(options.descending);
						}
						return collection.fetch(createSort(keys, descending));
					}
					return collection.fetch();
				}

				return new Promise((resolve) => {
					resolve([]);
				});
			}
		}));
	}
};
