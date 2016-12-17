import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnsState } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';

export default createWidgetBase.override({
	tagName: 'table',
	classes: ['dgrid-row-table'],
	nodeAttributes: [
		function () {
			return {
				role: 'presentation'
			};
		}
	],
	getChildrenNodes: function (this: Widget<WidgetState & ColumnsState>) {
		const {
			columns,
			item
		} = this.state;

		return [ v('tr', {},
			columns.map(column => {
				return w('dgrid-cell', {
					id: column.id,
					state: {
						column: column,
						item: item
					}
				});
			})
		) ];
	}
});
