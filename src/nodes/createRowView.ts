import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { DgridNodeOptions, HasItemIdentifier, DgridNode, HasItem } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { CellOptions } from './createCell';
import watchedPropertyComparisonMixin from '../mixins/watchedPropertyComparisonMixin';

export type RowViewOptions = DgridNodeOptions<null, HasItemIdentifier & HasItem>;

export type RowView = DgridNode<null, HasItemIdentifier & HasItem>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin(watchedPropertyComparisonMixin)
	.override(<Partial<RowView>> {
		tagName: 'table',
		classes: ['dgrid-row-table'],
		nodeAttributes: [
			function () {
				return {
					role: 'presentation'
				};
			}
		],
		applyChangedProperties: function() {
			// no new state
		},
		getChildrenNodes: function (this: RowView) {
			const {
				columns
			} = this.properties;

			return [
				v('tr', {},
					columns.map(column => {
						return w('dgrid-cell', <CellOptions> {
							id: column.id,
							parent: this,
							properties: create(this.properties, {
								column: column
							})
						});
					})
				)
			];
		}
	});
