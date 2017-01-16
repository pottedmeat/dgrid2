import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import delegatingFactoryRegistryMixin from '../mixins/delegatingFactoryRegistryMixin';
import { HasSort } from '../createDgrid';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';

export interface DgridHeaderCellProperties extends WidgetProperties {}

export interface DgridHeaderCellFactory extends ComposeFactory<Widget<DgridHeaderCellProperties>, WidgetOptions<WidgetState, DgridHeaderCellProperties>> {}

export default createWidgetBase
	.mixin(delegatingFactoryRegistryMixin)
	.mixin({
		mixin: {
			getHeaderCellViewProperties(): any {
				const {
					registry,
					properties: {
						column
					}
				} = this;

				return {
					registry,
					column
				};
			},
			getSortArrowProperties(): any {
				const {
					registry,
					properties: {
						sort,
						column
					}
				} = this;

				return {
					registry,
					sort,
					column
				};
			}
		}
	})
	.override({
		tagName: 'th',
		classes: ['dgrid-cell'],
		nodeAttributes: [
			function () {
				const {
					column,
					sort
				} = this.properties;

				return {
					classes: {
						'dgrid-sort-up': sort && !sort.descending,
						'dgrid-sort-down': sort && sort.descending
					},
					role: 'columnheader',
					sortable: column.sortable,
					field: column.field,
					columnId: column.id
				};
			}
		],
		diffProperties(previousProperties: HasSort, newProperties: HasSort): string[] {
			const changedPropertyKeys: string[] = [];
			if (previousProperties.sort !== newProperties.sort) {
				changedPropertyKeys.push('sort');
			}
			return changedPropertyKeys;
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function () {
			const children = [
				w('dgrid-header-cell-view', this.getHeaderCellViewProperties())
			];

			if (this.properties.sort) {
				children.unshift(w('dgrid-sort-arrow', this.getSortArrowProperties()));
			}
			return children;
		}
	});
