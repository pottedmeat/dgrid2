import createWidgetBase from 'dojo-widgets/createWidgetBase';
import {DgridNodeOptions, DgridNode, HasCollection, SortEvent} from '../createDgrid';
import { w, v } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { RowOptions } from './createRow';
import createSort from 'dojo-stores/query/createSort';
import watchedPropertyComparisonMixin from '../mixins/watchedPropertyComparisonMixin';

interface HasData {
	data: any[];
};

export type BodyOptions = DgridNodeOptions<null, null>;

export type Body = DgridNode<HasData, null>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin(watchedPropertyComparisonMixin)
	.override({
		watchedProperties: [ 'collection', 'sort' ]
	})
	.override(<Partial<Body>> {
		tagName: 'div',
		classes: ['dgrid-scroller'],
		applyChangedProperties: function(this: Body, previousProperties: HasCollection & HasData, { collection: newCollection, sort: newSort }: HasCollection): void {
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
		getChildrenNodes: function (this: Body) {
			const {
				collection
			} = this.properties;
			const {
				data = []
			} = this.state;

			return [ v('div.dgrid-content', {},
				data.map(item => {
					const id = collection.identify(item)[0];

					return w('dgrid-row', <RowOptions> {
						id,
						parent: this,
						properties: create(this.properties, {
							itemIdentifier: id,
							item
						})
					});
				})
			) ];
		}
	})
	.mixin({
		initialize(instance: Body, options: BodyOptions) {
			const {
				events
			} = options.properties;

			events.on('dgrid-sorted', (event: SortEvent) => {
				instance.invalidate();
			});
		}
	});
