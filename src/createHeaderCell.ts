import { VNodeProperties } from '@dojo/interfaces/vdom';
import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widgets/interfaces';
import createWidgetBase from '@dojo/widgets/createWidgetBase';
import { assign } from '@dojo/core/lang';
import { v } from '@dojo/widgets/d';
import { Column, SortDetail } from './createDgrid';

export interface DgridHeaderProperties extends WidgetProperties {
	id: string;
	column: Column;
	sortDetails?: SortDetail;
	onSortRequest(sortDetail: SortDetail): void;
}

export interface DgridHeaderMixin extends WidgetMixin<DgridHeaderProperties> {
	onSortRequest(event: any): void;
}

export type DgridHeader = Widget<DgridHeaderProperties> & DgridHeaderMixin

export interface DgridHeaderFactory extends WidgetFactory<DgridHeader, DgridHeaderProperties> { }

const createDgridHeader: DgridHeaderFactory = createWidgetBase
	.mixin({
		mixin: {
			tagName: 'th',
			classes: ['dgrid-cell'],
			onSortRequest(this: DgridHeader): void {
				const { key, sortDetails } = <DgridHeaderProperties> this.properties;
				this.properties.onSortRequest && this.properties.onSortRequest({
					columnId: key,
					descending: !!(sortDetails && sortDetails.columnId === key && !sortDetails.descending)
				});
			},
			nodeAttributes: [
				function(this: DgridHeader): VNodeProperties {
					const { sortDetails, column } = <DgridHeaderProperties> this.properties;

					const classes = sortDetails ? {
						'dgrid-sort-up': !sortDetails.descending,
						'dgrid-sort-down': sortDetails.descending
					} : {};

					const onclick = column.sortable ? { onclick: this.onSortRequest, bind: this } : {};

					return assign({ classes, role: 'columnheader' }, onclick);
				}
			],
			getChildrenNodes(this: DgridHeader): DNode[] {
				const { key, column, sortDetails } = <DgridHeaderProperties> this.properties;
				return [
					v('span', [ column.label ]),
					sortDetails && sortDetails.columnId === key ? v('div.dgrid-sort-arrow.ui-icon', { role: 'presentation' }) : null
				];
			}
		}
	});

export default createDgridHeader;
