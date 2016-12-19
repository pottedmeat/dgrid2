import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnState } from '../createDgrid';

export default createWidgetBase.override({
	tagName: 'span',
	listeners: {
		onclick: function (ev: MouseEvent) {
			console.log('cell view', this, arguments);
		}
	},
	getChildrenNodes: function (this: Widget<WidgetState & ColumnState>) {
		const {
			column
		} = this.state;

		return [ column.label ];
	}
});
