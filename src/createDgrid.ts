import { VNodeProperties } from '@dojo/interfaces/vdom';
import { Widget, WidgetMixin, WidgetProperties, WidgetFactory, DNode, PropertiesChangeEvent } from '@dojo/widget-core/interfaces';
import createWidgetBase from '@dojo/widget-core/createWidgetBase';
import { includes } from '@dojo/shim/array';
import { w } from '@dojo/widget-core/d';
import { FactoryRegistryInterface } from '@dojo/widget-core/interfaces';
import FactoryRegistry from '@dojo/widget-core/FactoryRegistry';

import createBody from './createBody';
import createRow from './createRow';
import createRowView from './createRowView';
import createCell from './createCell';
import createHeader from './createHeader';
import createHeaderCell from './createHeaderCell';
import createFooter from './createFooter';

function createRegistry(props: any) {
	const { customCell } = props;
	const registry = new FactoryRegistry();
	registry.define('dgrid-body', createBody);
	registry.define('dgrid-row', createRow);
	registry.define('dgrid-row-view', createRowView);
	registry.define('dgrid-cell', customCell || createCell);
	registry.define('dgrid-header', createHeader);
	registry.define('dgrid-header-cell', createHeaderCell);
	registry.define('dgrid-footer', createFooter);
	return registry;
}

export interface Column {
	id: string;
	label: string;
	field?: string;
	sortable?: boolean;
	color?: string;
	renderer?: (value: string) => string;
	renderExpando?: boolean;
}

export interface TreeProperties {
	onToggleExpandedRequest(item: ItemProperties): void;
}

export interface ItemProperties {
	id: string;
	expandedLevel?: number;
	isExpanded?: boolean;
	canExpand?: boolean;
	data: any;
}

export interface SortDetail {
	columnId: string;
	descending: boolean;
}

export interface RangeDetails {
	rangeStart?: number;
	rangeCount?: number;
}

export interface DataProperties {
	items: ItemProperties[];
	totalLength?: number;
	rangeStart?: number;
	rangeCount?: number;
	sortDetails?: SortDetail[];
	onSortRequest(sortDetail: SortDetail): void;
	onRangeRequest(rangeDetails: RangeDetails): void;
}

export interface PaginationDetails {
	pageNumber: number;
}

export interface PaginationProperties {
	itemsPerPage: number;
	onPaginationRequest?(paginationDetails: PaginationDetails): void;
}

export interface DgridProperties extends WidgetProperties {
	columns: Column[];
	customRow?: any;
	customCell?: any;
	data?: DataProperties;
	tree?: TreeProperties;
	pagination?: PaginationProperties;
}

export interface DgridMixin extends WidgetMixin<WidgetProperties> {
}

export type Dgrid = DgridMixin & Widget<DgridProperties>

export interface DgridFactory extends WidgetFactory<Dgrid, DgridProperties> { }

const createDgrid: DgridFactory = createWidgetBase
	.mixin({
		mixin: {
			classes: ['dgrid-widgets', 'dgrid', 'dgrid-grid'],
			nodeAttributes: [
				function(this: Dgrid, attributes: VNodeProperties): VNodeProperties {
					return { role: 'grid' };
				}
			],
			getChildrenNodes(this: Dgrid): DNode[] {
				const {
					registry,
					properties: {
						columns,
						data: {
							items,
							totalLength,
							rangeStart,
							rangeCount,
							sortDetails,
							onSortRequest
						},
						tree: {
							onToggleExpandedRequest = false
						} = {},
						pagination: {
							itemsPerPage = -1,
							onPaginationRequest = false
						} = {}
					}
				} = <{ registry?: FactoryRegistryInterface; properties: DgridProperties; }> this;

				return [
					w('dgrid-header', {
						registry,
						columns,
						sortDetails,
						onSortRequest: onSortRequest.bind(this)
					}),
					w('dgrid-body', {
						registry,
						columns,
						items,
						onToggleExpandedRequest: (onToggleExpandedRequest && onToggleExpandedRequest.bind(this))
					}),
					w('dgrid-footer', {
						registry,
						itemsPerPage,
						totalLength,
						rangeStart,
						rangeCount,
						onPaginationRequest: (onPaginationRequest && onPaginationRequest.bind(this))
					})
				];
			}
		},
		initialize(instance: Dgrid) {
			instance.registry = createRegistry(instance.properties);

			instance.own(instance.on('properties:changed', (evt: PropertiesChangeEvent<Dgrid, DgridProperties>) => {
				if (includes(evt.changedPropertyKeys, 'customCell')) {
					instance.registry = createRegistry(evt.properties);
				}

				// TODO add changed of items per page
			}));
		}
	});

export default createDgrid;
