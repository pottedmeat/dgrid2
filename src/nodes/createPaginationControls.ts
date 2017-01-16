import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { v } from 'dojo-widgets/d';
import { DNode, WidgetProperties, Widget, WidgetState } from 'dojo-widgets/interfaces';
import { PagingEvent, HasPagination } from '../mixins/paginationMixin';
import { HasDataTotal } from '../createDgrid';

export interface DgridPaginationControlsProperties extends WidgetProperties, HasPagination, HasDataTotal {}

export type DgridPaginationControls = Widget<DgridPaginationControlsProperties>;

interface DgridPaginationState extends WidgetState {
	currentPage: number;
};

function createPageLink(page: number, label: string, tabindex = '0'): DNode {
	return v('span.dgrid-page-link', {
		'aria-label': 'Go to page',
		tabindex
	}, [ label ]);
}

function createSkipNode(): DNode {
	return v('span.dgrid-page-skip', [ '...' ]);
}

function goToRelativePage(offset: number) {
	return function(this: DgridPaginationControls & { state: DgridPaginationState }, event: MouseEvent) {
		const {
			state: {
				currentPage = 0
			},
			properties: {
				rowsPerPage,
				dataTotal,
				onPagingEvent
			}
		} = this;

		const page = (currentPage + offset);
		const start = (page * rowsPerPage);
		if (start >= 0 && start < dataTotal) {
			this.state.currentPage = page;
			if (onPagingEvent) {
				onPagingEvent(<PagingEvent> {
					start: start,
					count: rowsPerPage
				});
			}
		}
	};
}

const goToPrevious = goToRelativePage(-1);

const goToNext = goToRelativePage(1);

const createPaginationControls = createWidgetBase
	.mixin({
		mixin: {
			createPageLinks(): DNode[] {
				const {
					state: {
						currentPage = 0
					},
					properties: {
						pagingLinkCount
					}
				} = this;

				const pageLinks: DNode[] = [];
				pageLinks.push(createPageLink(1, '1 ', '-1'));

				let start = (currentPage - pagingLinkCount);

				if (start > 2) {
					pageLinks.push(createSkipNode());
				}
				else {
					start = 2;
				}

				const totalPages = Math.ceil(this.properties.dataTotal / this.properties.rowsPerPage);
				for (let i = start; i < Math.min(currentPage + pagingLinkCount + 1, totalPages); i++) {
					pageLinks.push(createPageLink(i, i + ' '));
				}

				if (currentPage + pagingLinkCount + 1 < totalPages) {
					pageLinks.push(createSkipNode());
				}

				// last link
				if (totalPages > 1) {
					pageLinks.push(createPageLink(totalPages, String(totalPages)));
				}

				return pageLinks;
			},
			getPaginationStatus() {
				const {
					state: {
						currentPage = 0
					},
					properties: {
						rowsPerPage,
						dataTotal
					}
				} = this;

				const paginationStart = (currentPage * rowsPerPage) + 1;
				const paginationEnd = (paginationStart + rowsPerPage);

				return `${paginationStart} - ${paginationEnd} of ${dataTotal} results`;
			}
		}
	})
	.override({
		tagName: 'div',
		classes: [ 'dgrid-pagination' ],
		getChildrenNodes() {
			return [
				v('div.dgrid-status', {
					tabindex: '0'
				}, [ this.getPaginationStatus() ]),
				v('div.dgrid-navigation', [
					v('span.dgrid-previous.dgrid-page-link.dgrid-page-disabled', {
						'aria-label': 'Go to previous page',
						tabindex: '-1',
						onclick: goToPrevious,
						bind: this
					}, [ '<' ]),
					v('span.dgrid-pagination-links', this.createPageLinks()),
					v('span.dgrid-next.dgrid-page-link', {
						'aria-label': 'Go to next page',
						tabindex: '0',
						onclick: goToNext,
						bind: this
					}, [ '>' ])
				])
			];
		}
	});

export default createPaginationControls;