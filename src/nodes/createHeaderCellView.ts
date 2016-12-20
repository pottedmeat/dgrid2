import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumn, DgridNodeOptions, DgridNode } from '../createDgrid';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export type HeaderCellViewOptions = DgridNodeOptions<null, HasColumn>;

export type HeaderCellView = DgridNode<null, HasColumn>;

export default createWidgetBase.override(<Partial<HeaderCellView>> {
	tagName: 'span',
	listeners: <VNodeListeners> {
		onclick: function (ev: MouseEvent) {
			console.log('cell view', this, arguments);
		}
	},
	applyChangedProperties: function() {
		// no new state
	},
	getChildrenNodes: function (this: HeaderCellView) {
		const {
			column
		} = this.properties;

		return [ column.label ];
	}
});
