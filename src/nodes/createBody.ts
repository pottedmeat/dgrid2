import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasCollection, HasSort } from '../createDgrid';
import { w, v } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import createSort from 'dojo-stores/query/createSort';
import { filteredDiffProperties } from '../util';

interface HasData {
	data: any[];
};

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.around('diffProperties', filteredDiffProperties('sort'))
	.override({
		tagName: 'div',
		classes: ['dgrid-scroller'],
		applyChangedProperties: function(previousProperties: HasCollection & HasSort & HasData, { collection: newCollection, sort: newSort }: HasCollection & HasSort): void {
			if (newCollection || newSort) {
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
						properties: {
							item,
							columns: properties.columns
						}
					});
				})
			) ];
		}
	});
