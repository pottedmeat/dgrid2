import { Widget } from 'dojo-widgets/interfaces';
import { HasSort } from '../createDgrid';
import createSort from 'dojo-stores/query/createSort';
import { DgridBodyFactory, DgridBodyProperties } from '../nodes/createBody';
import { DgridCellViewFactory } from '../nodes/createCellView';
import externalState from 'dojo-widgets/mixins/externalState';
import { DgridCellFactory } from '../nodes/createCell';
import { ExternalStateProperties } from 'dojo-widgets/mixins/externalState';
import { DgridRowFactory } from '../nodes/createRow';
import { DgridRowViewFactory } from '../nodes/createRowView';

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
			getBodyProperties(properties: any) {
				properties.collection = this.properties.collection;
				return properties;
			}
		}
	},
	initialize(instance: Widget<DgridBodyProperties>) {
		const registry = instance.registry;

		const body: DgridBodyFactory = <any> registry.get('dgrid-body');
		registry.define('dgrid-body', body
			.around('diffProperties', function(diffProperties: () => string[]) {
				// add collection check (by reference) to dgrid-body
				return function(previousProperties: HasCollection, newProperties: HasCollection) {
					const changedPropertyKeys = diffProperties.apply(this, arguments);
					if (previousProperties.collection !== newProperties.collection) {
						changedPropertyKeys.push('collection');
					}
					return changedPropertyKeys;
				};
			})
			.override({
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
								descending.push(!!options.descending);
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
					properties.collection = collection;
					return properties;
				};
			})
		);

		const row: DgridRowFactory = <any> registry.get('dgrid-row');
		registry.define('dgrid-row', row
			.after('getRowViewProperties', function(properties: HasCollection) {
				properties.collection = this.properties.collection;
				return properties;
			})
		);

		const rowView: DgridRowViewFactory = <any> registry.get('dgrid-row-view');
		registry.define('dgrid-row-view', rowView
			.after('getCellProperties', function(properties: HasCollection) {
				properties.collection = this.properties.collection;
				return properties;
			})
		);

		const cell: DgridCellFactory = <any> registry.get('dgrid-cell');
		registry.define('dgrid-cell', cell
			.after('getCellViewProperties', function(properties: ExternalStateProperties) {
				const {
					properties: {
						itemIdentifier,
						collection
					}
				} = this;
				properties.id = itemIdentifier;
				properties.externalState = collection;
				return properties;
			})
		);

		const cellView: DgridCellViewFactory = <any> registry.get('dgrid-cell-view');
		// add external state mixin to cell views
		registry.define('dgrid-cell-view', cellView
			.mixin(externalState)
			.override({
				getItem() {
					return this.state;
				}
			})
		);
	}
};
