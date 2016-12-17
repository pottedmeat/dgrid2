import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnState } from '../createDgrid';

export default createWidgetBase.override({
	getChildrenNodes: function (this: Widget<WidgetState & ColumnState>) {
		const {
			column
		} = this.state;

		return [ column.label ];
	}
});
