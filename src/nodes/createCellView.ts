import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumn, DgridNodeOptions, HasItemIdentifier, DgridNode, HasItem } from '../createDgrid';

export type CellViewOptions = DgridNodeOptions<null, HasItemIdentifier & HasItem & HasColumn>;

export type CellView = DgridNode<null, HasItemIdentifier & HasItem & HasColumn>;

export default createWidgetBase
	.override(<Partial<CellView>> {
		getChildrenNodes: function (this: CellView) {
			const {
				item,
				column
			} = this.properties;

			const value = item[column.field];
			return value ? [ '' + item[column.field] ] : [];
		}
	});
