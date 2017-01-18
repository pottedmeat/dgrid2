import { ComposeFactory } from '@dojo/compose/compose';
import { Widget, WidgetProperties, WidgetOptions, WidgetState, DNode } from '@dojo/widgets/interfaces';
import {DgridProperties, HasDataTotal, Dgrid, DgridState, HasSort} from '../createDgrid';
import { DgridFooterFactory } from '../nodes/createFooter';
import { registry, w } from '@dojo/widgets/d';
import createPaginationControls from '../nodes/createPaginationControls';
import {HasCollection} from "./storeMixin";

registry.define('dgrid-pagination-controls', createPaginationControls);

export interface PagingEvent {
	page: number;
	start: number;
	count: number;
}

export interface HasPage {
	page: number;
}

export interface HasPagination extends HasPage {
	pagingLinkCount: number;
	rowsPerPage: number;
	onPagingEvent: (event: PagingEvent) => void;
}

export interface PaginationMixinProperties extends WidgetProperties, HasPagination {}

export type PaginationMixin = Widget<PaginationMixinProperties>;

export interface PaginationMixinFactory extends ComposeFactory<PaginationMixin, WidgetOptions<WidgetState, PaginationMixinProperties>> {}

function onPaging(this: Dgrid & { state: DgridState & HasPage }, event: PagingEvent) {
	this.state.dataRangeStart = event.start;
	this.state.dataRangeCount = event.count;
	this.state.page = event.page;
	this.invalidate();
}

const paginationPropertyKeys: Array<keyof (HasPagination & HasDataTotal)> = [ 'page', 'pagingLinkCount', 'rowsPerPage', 'onPagingEvent', 'dataTotal' ];

const paginationMixin: PaginationMixinFactory = <any> {
	aspectAdvice: {
		before: {
			setProperties<P extends HasPagination>(this: Widget<P> & { state: DgridState }, properties: P) {
				properties.page = (properties.page || 1);
				properties.pagingLinkCount = (properties.pagingLinkCount || 2);
				properties.rowsPerPage = (properties.rowsPerPage || 10);
				properties.onPagingEvent = onPaging.bind(this);
				const {
					state: {
						dataRangeStart = 0,
						dataRangeCount = properties.rowsPerPage
					}
				} = this;
				this.state.dataRangeStart = dataRangeStart;
				this.state.dataRangeCount = dataRangeCount;
				return arguments;
			}
		},
		around: {
			diffProperties<P extends HasPagination & HasSort>(diffProperties: () => string[]) {
				return function(previousProperties: P, newProperties: P) {
					const changedPropertyKeys = diffProperties.apply(this, arguments);
					if (changedPropertyKeys.indexOf('sort') !== -1) {
						// change page to 1 when a new sort is assigned
						newProperties.page = 1;
						changedPropertyKeys.push('page');
					}
					else if (previousProperties.page !== newProperties.page) {
						changedPropertyKeys.push('page');
					}
					return changedPropertyKeys;
				};
			}
		},
		after: {
			getFooterProperties<P extends HasPagination & HasDataTotal>(this: Widget<P> & { state: DgridState & HasPage }, properties: P) {
				properties.page = this.state.page;
				properties.pagingLinkCount = this.properties.pagingLinkCount;
				properties.rowsPerPage = this.properties.rowsPerPage;
				properties.dataTotal = this.state.dataTotal;
				properties.onPagingEvent = this.properties.onPagingEvent;
				return properties;
			}
		}
	},
	initialize(instance: Widget<DgridProperties & HasPagination>) {
		const registry = instance.registry;

		const footer: DgridFooterFactory = <any> registry.get('dgrid-footer');
		registry.define('dgrid-footer', footer
			.around('diffProperties', function<P extends HasPagination & HasDataTotal>(diffProperties: () => string[]) {
				// add collection check (by reference) to dgrid-body
				return function(previousProperties: P, newProperties: P) {
					const changedPropertyKeys = diffProperties.apply(this, arguments);
					for (const key of paginationPropertyKeys) {
						if (previousProperties[key] !== newProperties[key]) {
							changedPropertyKeys.push(key);
						}
					}
					return changedPropertyKeys;
				};
			})
			.after('getChildrenNodes', function (this: Widget<HasPagination & HasDataTotal>, children: DNode[]) {
				const {
					properties: {
						page,
						dataTotal,
						pagingLinkCount,
						rowsPerPage,
						onPagingEvent
					}
				} = this;

				if (dataTotal) {
					children.push(
						w('dgrid-pagination-controls', {
							page,
							registry,
							dataTotal,
							pagingLinkCount,
							rowsPerPage,
							onPagingEvent
						})
					);
				}
				return children;
			})
		);
	}
};

export default paginationMixin;
