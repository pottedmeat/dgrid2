import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumn, DgridNodeOptions, HasItemIdentifier, DgridNode, HasItem } from '../createDgrid';
import watchedPropertyComparisonMixin from '../mixins/watchedPropertyComparisonMixin';

export type CellViewOptions = DgridNodeOptions<null, HasItemIdentifier & HasItem & HasColumn>;

export type CellView = DgridNode<null, HasItemIdentifier & HasItem & HasColumn>;

export default createWidgetBase
	.mixin(watchedPropertyComparisonMixin)
	.override(<Partial<CellView>> {
		applyChangedProperties: function() {
			// no new state
		},
		getChildrenNodes: function (this: CellView) {
			const {
				item,
				column
			} = this.properties;

			const value = item[column.field];
			return value ? [ '' + item[column.field] ] : [];
		}
	});
