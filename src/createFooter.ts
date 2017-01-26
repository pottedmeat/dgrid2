import { VNodeProperties } from '@dojo/interfaces/vdom';
import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode } from '@dojo/widgets/interfaces';
import createWidgetBase from '@dojo/widgets/createWidgetBase';
import { v } from '@dojo/widgets/d';
import { PaginationProperties, PaginationDetails }  from './createDgrid';

export interface DgridFooterProperties extends WidgetProperties {
	pagination?: PaginationProperties;
	rangeStart?: number;
	rangeCount?: number;
	totalLength?: number;
	onPaginationRequest(paginationDetails: PaginationDetails): void;
}

export interface DgridFooterMixin extends WidgetMixin<DgridFooterProperties> {
	onClick(this: DgridFooter, evt: MouseEvent): void;
	createPageLink(this: DgridFooter, page: string, visable: boolean, disabled: boolean): DNode;
}

export type DgridFooter = Widget<DgridFooterProperties> & DgridFooterMixin

export interface DgridFooterFactory extends WidgetFactory<DgridFooter, DgridFooterProperties> { }

const createDgridFooter: DgridFooterFactory = createWidgetBase
.mixin({
	mixin: {
		tagName: 'div',
		classes: [ 'dgrid-footer' ],
		onClick(this: DgridFooter, evt: any) {
			this.properties.onPaginationRequest && this.properties.onPaginationRequest({
				pageNumber: parseInt(evt.target.getAttribute('page'), 10)
			);
		},
		createPageLink(this: DgridFooter, page: string, visable: boolean, disabled: boolean): DNode {
			if (visable) {
				const classes = {
					'dgrid-page-disabled': disabled
				};
				return v('span.dgrid-page-link', { onclick: this.onClick, page, classes }, [ page ]);
			}
			return null;
		},
		getChildrenNodes(this: DgridFooter): VNodeProperties {
			const { properties: { itemsPerPage, rangeStart, rangeCount, totalLength } } = this;
			let pageNumber = 1;
			if (itemsPerPage > 0) {
				pageNumber = Math.floor(rangeStart / itemsPerPage) + 1;
			}
			const totalPages = Math.ceil(totalLength / rangeCount);
			return [
				(itemsPerPage > 0) ? v('div.dgrid-pagination', [
					v('div.dgrid-status', [ `${rangeStart + 1} - ${rangeStart + rangeCount} of ${totalLength} results` ]),
					v('div.dgrid-navigation', [
						v('span.dgrid-previous.dgrid-page-link', { onclick: this.onClick, page: String(pageNumber - 1), classes: { 'dgrid-page-disabled': (pageNumber === 1) } }, [ '<' ]),
						v('span.dgrid-pagination-links', [
							v('span.dgrid-page-link', { onclick: this.onClick, page: '1', classes: { 'dgrid-page-disabled': pageNumber === 1 } }, [ '1' ]),
							pageNumber > 3 ? v('span.dgrid-page-skip', [ '...' ]) : null,
							this.createPageLink(String(pageNumber - 2), Boolean(pageNumber - 2 > 1), false),
							this.createPageLink(String(pageNumber - 1), Boolean(pageNumber - 1 > 1), false),
							this.createPageLink(String(pageNumber), Boolean(pageNumber !== 1 && pageNumber !== totalPages), true),
							this.createPageLink(String(pageNumber + 1), Boolean(pageNumber + 1 < totalPages), false),
							this.createPageLink(String(pageNumber + 2), Boolean(pageNumber + 2 < totalPages), false),
							pageNumber !== totalPages ? v('span.dgrid-page-skip', [ '...' ]) : null,
							v('span.dgrid-page-link', { onclick: this.onClick, bind: this, page: String(totalPages), classes: { 'dgrid-page-disabled': pageNumber === totalPages } }, [ String(totalPages) ])
						]),
						v('span.dgrid-next.dgrid-page-link', { onclick: this.onClick, page: String(pageNumber + 1), classes: { 'dgrid-page-disabled': ((pageNumber * rangeCount) >= totalLength) } }, [ '>' ])
					])
				]) : v('div.dgrid-status', [ `${totalLength} results` ])
			];
		}
	}
});

export default createDgridFooter;
