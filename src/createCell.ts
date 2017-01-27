import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widget-core/interfaces';
import createWidgetBase from '@dojo/widget-core/createWidgetBase';
import { Column, ItemProperties } from './createDgrid';
import { v } from '@dojo/widget-core/d';

export interface DgridCellProperties extends WidgetProperties {
	data: string;
	column: Column;
	item: ItemProperties,
	expandedLevel: number;
	isExpanded: boolean;
	canExpand: boolean;
	onToggleExpandedRequest(item: ItemProperties): void;
}

export interface DgridCellMixin extends WidgetMixin<DgridCellProperties> {
	onExpandoClick(this: DgridCell, evt: MouseEvent): void;
}

export type DgridCell = Widget<DgridCellProperties> & DgridCellMixin

export interface DgridCellFactory extends WidgetFactory<DgridCell, DgridCellProperties> { }

const createDgridCell: DgridCellFactory = createWidgetBase
	.mixin({
		mixin: {
			tagName: 'td',
			classes: [ 'dgrid-cell' ],
			onExpandoClick(this: DgridCell, evt: any) {
				this.properties.onToggleExpandedRequest && this.properties.onToggleExpandedRequest(this.properties.item);
			},
			getChildrenNodes(this: DgridCell): DNode[] {
				const {
					properties: {
						data,
						renderer,
						renderExpando,
						expandedLevel,
						isExpanded,
						canExpand
					}
				} = this;

				const value = renderer ? renderer(data) : data;

				return [
					renderExpando ? v('div.dgrid-expando-icon', {
						classes: {
							'ui-icon': canExpand,
							'ui-icon-triangle-1-e': !isExpanded,
							'ui-icon-triangle-1-se': isExpanded
						},
						onclick: this.onExpandoClick,
						styles: {
							'margin-left': (expandedLevel * 9) + 'px',
							'float': 'left'
						}
					}, [ ' ' ]) : null,
					value ? value.toString() : null
				];
			}
		}
	});

export default createDgridCell;
