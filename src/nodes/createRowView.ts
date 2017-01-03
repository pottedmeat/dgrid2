import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { DgridNodeOptions, HasItemIdentifier, DgridNode, HasItem, HasColumn } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { CellOptions } from './createCell';

export type RowViewOptions = DgridNodeOptions<null, HasItemIdentifier & HasItem>;

export type RowView = DgridNode<null, HasItemIdentifier & HasItem>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
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
		getChildrenNodes: function (this: RowView) {
			const {
				columns
			} = this.properties;

			return [
				v('tr', {},
					columns.map(column => {
						const properties = create(this.properties, <HasColumn> null);
						properties.column = column;

						return w('dgrid-cell', <CellOptions> {
							id: column.id,
							parent: this,
							properties: properties
						});
					})
				)
			];
		}
	});
