import { ComposeFactory } from '@dojo/compose/compose';
import { Widget, WidgetProperties, WidgetOptions, WidgetState, DNode } from '@dojo/widgets/interfaces';
import { DgridProperties, HasDataTotal, Dgrid, DgridState } from '../createDgrid';
import { DgridFooterFactory } from '../nodes/createFooter';
import { registry, w } from '@dojo/widgets/d';
import createPaginationControls from '../nodes/createPaginationControls';

registry.define('dgrid-pagination-controls', createPaginationControls);

export interface PagingEvent {
	start: number;
	count: number;
}

export interface HasPagination {
	pagingLinkCount: number;
	rowsPerPage: number;
	onPagingEvent: (event: PagingEvent) => void;
}

export interface PaginationMixinProperties extends WidgetProperties, HasPagination {}

export type PaginationMixin = Widget<PaginationMixinProperties>;

export interface PaginationMixinFactory extends ComposeFactory<PaginationMixin, WidgetOptions<WidgetState, PaginationMixinProperties>> {}

function onPaging(this: Dgrid & { state: DgridState }, event: PagingEvent) {
	this.state.dataRangeStart = event.start;
	this.state.dataRangeCount = event.count;
	this.invalidate();
}

const paginationPropertyKeys: Array<keyof (HasPagination & HasDataTotal)> = [ 'pagingLinkCount', 'rowsPerPage', 'onPagingEvent', 'dataTotal' ];

const paginationMixin: PaginationMixinFactory = <any> {
	aspectAdvice: {
		before: {
			setProperties<P extends HasPagination>(this: Widget<P> & { state: DgridState }, properties: P) {
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
		after: {
			getFooterProperties<P extends HasPagination & HasDataTotal>(this: Widget<P> & { state: DgridState}, properties: P) {
				// TODO: Detect when sort/data change
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
						dataTotal,
						pagingLinkCount,
						rowsPerPage,
						onPagingEvent
					}
				} = this;

				if (dataTotal) {
					children.push(
						w('dgrid-pagination-controls', {
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
