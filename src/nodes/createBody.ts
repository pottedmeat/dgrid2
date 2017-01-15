import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasSort } from '../createDgrid';
import { w, v } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import Promise from 'dojo-shim/Promise';
import { ComposeFactory } from 'dojo-compose/compose';
import { Widget, WidgetProperties, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';

export interface HasData {
	data: any[];
	idProperty?: string;
};

export interface DgridBodyProperties extends WidgetProperties, HasData, HasSort {}

export interface DgridBodyFactory extends ComposeFactory<Widget<DgridBodyProperties>, WidgetOptions<WidgetState, DgridBodyProperties>> {}

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin({
		mixin: {
			getRowProperties(item: any): any {
				const {
					registry,
					properties: {
						idProperty,
						columns
					}
				} = this;

				return {
					id: item[idProperty],
					item,
					registry,
					columns
				};
			},
			getData(properties: DgridBodyProperties): Promise<any[]> {
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
		diffProperties(previousProperties: DgridBodyProperties, newProperties: DgridBodyProperties): string[] {
			const changedPropertyKeys: string[] = [];
			if (!previousProperties.data && newProperties.data) {
				changedPropertyKeys.push('data');
			}
			if (previousProperties.sort !== newProperties.sort) {
				changedPropertyKeys.push('sort');
			}
			return changedPropertyKeys;
		},
		assignProperties: function(previousProperties: DgridBodyProperties & HasData, newProperties: DgridBodyProperties, changedPropertyKeys: string[]) {
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
				data = []
			} = <HasData> this.state;

			return [ v('div.dgrid-content', {},
				data.map((item) => {
					return w('dgrid-row', this.getRowProperties(item));
				})
			) ];
		}
	});
