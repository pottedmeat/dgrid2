import createWidgetBase from 'dojo-widgets/createWidgetBase';
import {HasColumn, DgridNodeOptions, DgridNode, SortTarget, SortEvent} from '../createDgrid';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export type HeaderCellViewOptions = DgridNodeOptions<null, HasColumn>;

export type HeaderCellView = DgridNode<null, HasColumn>;

export default createWidgetBase
	.override(<Partial<HeaderCellView>> {
		tagName: 'span',
		listeners: <VNodeListeners> {
			onclick: function (this: HeaderCellView, event: MouseEvent) {
				const {
					events
				} = this.properties;

				let target = <SortTarget> event.target;
				while (target.parentElement) {
					if (target.sortable) {
						events.emit(<SortEvent> {
							type: 'dgrid-sort',
							event: event,
							target: target
						});
						return;
					}
					target = target.parentElement;
				}
			}
		},
		getChildrenNodes: function (this: HeaderCellView) {
			const {
				column
			} = this.properties;

			return [ column.label ];
		}
	});
