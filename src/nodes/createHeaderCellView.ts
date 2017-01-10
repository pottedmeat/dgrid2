import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { SortTarget, SortEvent, HasSortEvent } from '../createDgrid';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export default createWidgetBase
	.override({
		tagName: 'span',
		listeners: <VNodeListeners> {
			onclick: function (event: MouseEvent) {
				const properties = <HasSortEvent> this.properties;

				let target = <SortTarget> event.target;
				while (target.parentElement) {
					if (target.sortable) {
						properties.onSortEvent(<SortEvent> {
							event: event,
							target: target
						});
						return;
					}
					target = target.parentElement;
				}
			}
		},
		diffProperties(): string[] {
			return [];
		},
		getChildrenNodes: function () {
			const {
				column
			} = this.properties;

			return [ column.label ];
		}
	});
