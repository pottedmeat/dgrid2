import { Widget } from 'dojo-widgets/interfaces';
import { HasSort } from '../createDgrid';
import createSort from 'dojo-stores/query/createSort';
import { DgridBodyFactory, DgridBodyProperties } from '../nodes/createBody';

export interface HasCollection {
	collection?: any;
}

export default {
	mixin: <HasCollection> { },
	aspectAdvice: {
		around: {
			diffProperties(diffProperties: () => string[]) {
				// add collection check (by reference) to dgrid-body
				return function(previousProperties: HasCollection, newProperties: HasCollection) {
					const changedPropertyKeys = diffProperties.apply(this, arguments);
					if (previousProperties.collection !== newProperties.collection) {
						changedPropertyKeys.push('collection');
					}
					return changedPropertyKeys;
				};
			}
		},
		after: {
			getBodyProperties(item: any) {
				item.collection = this.properties.collection;
				return item;
			}
		}
	},
	initialize(instance: Widget<DgridBodyProperties>) {
		const registry = instance.registry;

		const body: DgridBodyFactory = <any> registry.get('dgrid-body');
		body.around('diffProperties', function(diffProperties: () => string[]) {
			// add collection check (by reference) to dgrid-body
			return function(previousProperties: HasCollection, newProperties: HasCollection) {
				const changedPropertyKeys = diffProperties.apply(this, arguments);
				if (previousProperties.collection !== newProperties.collection) {
					changedPropertyKeys.push('collection');
				}
				return changedPropertyKeys;
			};
		});
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
		}).around('getRowProperties', function(getRowProperties: () => any) {
			return function(item: any) {
				const properties = getRowProperties.apply(this, arguments);
				const {
					properties: {
						collection
					}
				} = this;
				properties.id = collection.identify(item);
				return properties;
			};
		}));
	}
};
