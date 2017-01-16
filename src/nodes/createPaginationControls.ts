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

function createPageLink(page: number, label: string, disabled: boolean, tabindex = '0'): DNode {
	return v('span.dgrid-page-link', {
		classes: {
			'dgrid-page-disabled': disabled
		},
		'aria-label': 'Go to page',
		page,
		tabindex
	}, [ label ]);
}

function createSkipNode(): DNode {
	return v('span.dgrid-page-skip', [ '...' ]);
}

export interface PagingTarget extends HTMLElement {
	page: number;
	parentElement: PagingTarget;
}

function onClick(this: DgridPaginationControls & { state: DgridPaginationState }, event: MouseEvent) {
	const {
		properties: {
			rowsPerPage,
			dataTotal,
			onPagingEvent
		}
	} = this;

	if (onPagingEvent) {
		let target = <PagingTarget> event.target;
		while (target.parentElement) {
			if (target.page) {
				const page = target.page;
				const start = ((page - 1) * rowsPerPage);
				if (start >= 0 && start < dataTotal) {
					this.state.currentPage = page;
					if (onPagingEvent) {
						onPagingEvent(<PagingEvent> {
							start: start,
							count: rowsPerPage
						});
					}
				}
				return;
			}
			target = target.parentElement;
		}
	}
}

const createPaginationControls = createWidgetBase
	.mixin({
		mixin: {
			createPageLinks(): DNode[] {
				const {
					state: {
						currentPage = 1
					},
					properties: {
						pagingLinkCount,
						dataTotal,
						rowsPerPage
					}
				} = this;

				const pageLinks: DNode[] = [];
				pageLinks.push(createPageLink(1, '1 ', currentPage === 1, '-1'));

				let start = (currentPage - pagingLinkCount);

				if (start > 2) {
					pageLinks.push(createSkipNode());
				}
				else {
					start = 2;
				}

				const totalPages = Math.ceil(dataTotal / rowsPerPage);
				for (let i = start; i < Math.min(currentPage + pagingLinkCount + 1, totalPages); i++) {
					pageLinks.push(createPageLink(i, i + ' ', currentPage === i));
				}

				if (currentPage + pagingLinkCount + 1 < totalPages) {
					pageLinks.push(createSkipNode());
				}

				// last link
				if (totalPages > 1) {
					pageLinks.push(createPageLink(totalPages, String(totalPages), currentPage === totalPages));
				}

				return pageLinks;
			},
			getPaginationStatus() {
				const {
					state: {
						currentPage = 1
					},
					properties: {
						rowsPerPage,
						dataTotal
					}
				} = this;

				const paginationStart = ((currentPage - 1) * rowsPerPage) + 1;
				const paginationEnd = (paginationStart + rowsPerPage);

				return `${paginationStart} - ${paginationEnd} of ${dataTotal} results`;
			}
		}
	})
	.override({
		tagName: 'div',
		classes: [ 'dgrid-pagination' ],
		nodeAttributes: [
			function () {
				return {
					onclick: onClick,
					bind: this
				};
			}
		],
		getChildrenNodes() {
			const {
				state: {
					currentPage = 1
				},
				properties: {
					rowsPerPage,
					dataTotal
				}
			} = this;

			return [
				v('div.dgrid-status', {
					tabindex: '0'
				}, [ this.getPaginationStatus() ]),
				v('div.dgrid-navigation', [
					v('span.dgrid-previous.dgrid-page-link', {
						classes: {
							'dgrid-page-disabled': (currentPage === 1)
						},
						'aria-label': 'Go to previous page',
						tabindex: '-1',
						page: (currentPage - 1)
					}, [ '<' ]),
					v('span.dgrid-pagination-links', this.createPageLinks()),
					v('span.dgrid-next.dgrid-page-link', {
						classes: {
							'dgrid-page-disabled': ((currentPage * rowsPerPage) >= dataTotal)
						},
						'aria-label': 'Go to next page',
						tabindex: '0',
						page: (currentPage + 1)
					}, [ '>' ])
				])
			];
		}
	});

export default createPaginationControls;
