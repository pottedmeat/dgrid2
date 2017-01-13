import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasCollection, HasSort } from '../createDgrid';
import { w, v } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import Promise from 'dojo-shim/Promise';

interface HasData {
	data: any[];
	idProperty?: string;
};

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin({
		mixin: {
			getData(properties: HasData & HasSort): Promise<any[]> {
				return new Promise((resolve) => {
					let {
						data,
						sort
					} = properties;

					if (sort) {
						data = data.sort((a: any, b: any) => {
							for (let field of sort) {
								const aValue = a[field.property];
								const bValue = b[field.property];
								const descending = field.descending;
								if (aValue !== bValue) {
									if (descending) {
										return (aValue > bValue ? -1 : 1);
									}
									else {
										return (aValue < bValue ? -1 : 1);
									}
								}
							}
							return 0;
						});
					}
					resolve(data);
				});
			}
		}
	})
	.override({
		tagName: 'div',
		classes: ['dgrid-scroller'],
		diffProperties(previousProperties: HasData & HasCollection & HasSort, newProperties: HasData & HasCollection & HasSort): string[] {
			const changedPropertyKeys: string[] = [];
			if (!previousProperties.data && newProperties.data) {
				changedPropertyKeys.push('data');
			}
			if (previousProperties.collection !== newProperties.collection) {
				changedPropertyKeys.push('collection');
			}
			if (previousProperties.sort !== newProperties.sort) {
				changedPropertyKeys.push('sort');
			}
			return changedPropertyKeys;
		},
		assignProperties: function(previousProperties: HasCollection & HasSort & HasData, newProperties: HasCollection & HasSort, changedPropertyKeys: string[]) {
			if (changedPropertyKeys.length) {
				this.getData(newProperties).then((data: any[]) => {
					this.state.data = data;
					this.invalidate();
				});
			}

			return newProperties;
		},
		getChildrenNodes: function () {
			const {
				properties,
				registry
			} = this;
			const {
				collection,
				idProperty
			} = properties;
			const {
				data = []
			} = <HasData> this.state;

			return [ v('div.dgrid-content', {},
				data.map((item) => {
					return w('dgrid-row', {
						id: (collection ? collection.identify(item) : item[idProperty]),
						registry,
						item,
						columns: properties.columns
					});
				})
			) ];
		}
	});
