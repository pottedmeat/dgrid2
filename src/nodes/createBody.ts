import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasCollection, HasSort } from '../createDgrid';
import { w, v } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import createSort from 'dojo-stores/query/createSort';

interface HasData {
	data: any[];
};

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'div',
		classes: ['dgrid-scroller'],
		diffProperties(previousProperties: HasCollection & HasSort, newProperties: HasCollection & HasSort): string[] {
			const changedPropertyKeys: string[] = [];
			if (previousProperties.collection !== newProperties.collection) {
				changedPropertyKeys.push('collection');
			}
			if (previousProperties.sort !== newProperties.sort) {
				changedPropertyKeys.push('sort');
			}
			return changedPropertyKeys;
		},
		assignProperties: function(previousProperties: HasCollection & HasSort & HasData, newProperties: HasCollection & HasSort, changedPropertyKeys: string[]) {
			const {
				collection: newCollection,
				sort: newSort
			} = newProperties;

			if (changedPropertyKeys.indexOf('collection') !== -1 || changedPropertyKeys.indexOf('sort') !== -1) {
				const collection = (newCollection || this.properties.collection);
				const sort = (newSort || this.properties.sort);
				if (collection) {
					const fetch = (sort && sort.length) ? collection.fetch(createSort(sort[0].property, sort[0].descending)) : collection.fetch();
					fetch.then((results: any[]) => {
						this.state.data = results;
						this.invalidate();
					});
				}
			}

			return newProperties;
		},
		getChildrenNodes: function () {
			const {
				properties,
				registry
			} = this;
			const collection = properties.collection;
			const {
				data = []
			} = <HasData> this.state;

			return [ v('div.dgrid-content', {},
				data.map((item) => {
					return w('dgrid-row', {
						id: collection.identify(item),
						registry,
						item,
						columns: properties.columns
					});
				})
			) ];
		}
	});
