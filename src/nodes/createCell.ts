import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumn, DgridNodeOptions, HasItemIdentifier, DgridNode, HasItem } from '../createDgrid';
import { w } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { CellViewOptions } from './createCellView';
import watchedPropertyComparisonMixin from '../mixins/watchedPropertyComparisonMixin';

export type CellOptions = DgridNodeOptions<null, HasItemIdentifier & HasItem & HasColumn>;

export type Cell = DgridNode<HasColumn, HasItemIdentifier & HasItem & HasColumn>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin(watchedPropertyComparisonMixin)
	.override({
		watchedProperties: [ 'column' ]
	})
	.override(<Partial<Cell>> {
		tagName: 'td',
		classes: ['dgrid-cell'],
		nodeAttributes: [
			function () {
				return {
					role: 'gridcell'
				};
			}
		],
		applyChangedProperties: function(previousProperties: HasColumn, currentProperties: HasColumn) {
			this.state.column = currentProperties.column;
		},
		getChildrenNodes: function (this: Cell) {
			return [
				w('dgrid-cell-view', <CellViewOptions> {
					parent: this,
					properties: create(this.properties, null)
				})
			];
		}
	});
