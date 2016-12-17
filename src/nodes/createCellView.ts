import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnState } from '../createDgrid';

export default createWidgetBase.override({
	getChildrenNodes: function (this: Widget<WidgetState & ColumnState>) {
		const {
			column,
			item
		} = this.state;

		const value = item[column.field];
		return value ? [ '' + item[column.field] ] : [];
	}
});
