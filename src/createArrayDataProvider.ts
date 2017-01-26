import {
	Dgrid,
	ItemProperties,
	SortDetail,
	PaginationDetails,
	RangeDetails, DataProperties, TreeProperties, PaginationProperties
} from './createDgrid';

export interface ArrayDataProviderOptions {
	items: any[];
	idProperty?: string;
	itemsPerPage?: number;
	sortDetails?: SortDetail[];
}

export interface ArrayDataProvider {
	properties: {
		data: DataProperties;
		tree: TreeProperties;
		pagination: PaginationProperties;
	};
}

function expand(items: any[], idProperty: string, expanded: { [key: string]: any }, until = Infinity, array = <ItemProperties[]> [], parent: string = '', depth = 0) {
	for (const item of items) {
		if (array.length >= until) {
			return array;
		}

		const id = item[idProperty];
		const isExpanded = expanded[id];
		const canExpand = !!(item.children && item.children.length);
		if (parent) {
			if (parent === item.parent) {
				array.push({
					id,
					expandedLevel: depth,
					isExpanded,
					canExpand,
					data: item
				});
				if (isExpanded) {
					expand(items, idProperty, expanded, until, array, parent, depth);
				}
			}
		}
		else if (!item.parent) {
			array.push({
				id,
				canExpand,
				data: item
			});
		}
	}
	return array;
}

function createArrayDataProvider(options: ArrayDataProviderOptions): ArrayDataProvider {
	let {
		items,
		idProperty = 'id',
		itemsPerPage = -1
	} = options;
	const expanded: { [key: string]: any } = {};

	const instance = <ArrayDataProvider> {
		properties: {}
	};
	const properties = instance.properties;
	properties.data = {
		sortDetails: options.sortDetails,
		get items(): ItemProperties[] {
			const {
				sortDetails = []
			} = properties.data;
			let data = items;
			if (sortDetails.length) {
				data = items.sort((a: any, b: any) => {
					for (let field of sortDetails) {
						const aValue = a[ field.columnId ];
						const bValue = b[ field.columnId ];
						const descending = field.descending;
						if (aValue !== bValue) {
							if (descending) {
								return (aValue > bValue ? -1 : 1);
							}
							else {
								return (aValue < bValue ? -1 : 1);
							}
						}
					}
					return 0;
				});
			}
			const {
				rangeStart = -1,
				rangeCount = -1
			} = properties.data;
			const itemProperties = expand(data, idProperty, expanded, (rangeCount > -1 ? rangeStart + rangeCount : Infinity));
			if (rangeStart > -1) {
				return itemProperties.slice(rangeStart);
			}
			return itemProperties;
		},
		get totalLength() {
			return items.length;
		},
		onSortRequest(this: Dgrid, sortDetail: SortDetail) {
			properties.data.rangeStart = 0;
			properties.data.sortDetails = [ sortDetail ];
			this.invalidate();
		},
		onRangeRequest(this: Dgrid, rangeDetails: RangeDetails) {
			properties.data.rangeStart = rangeDetails.rangeStart;
			properties.data.rangeCount = rangeDetails.rangeCount;
			this.invalidate();
		}
	};
	if (itemsPerPage > 0) {
		properties.data.rangeStart = 0;
		properties.data.rangeCount = itemsPerPage;
	}
	properties.tree = {
		onCollapseRequest(this: Dgrid, item: any) {
			expanded[ item[ idProperty ] ] = false;
			this.invalidate();
		},
		onExpandRequest(this: Dgrid, item: any) {
			expanded[ item[ idProperty ] ] = true;
			this.invalidate();
		}
	};
	properties.pagination = {
		itemsPerPage,
		onPaginationRequest(this: Dgrid, paginationDetails: PaginationDetails): void {
			properties.data.rangeStart = ((paginationDetails.pageNumber - 1) * itemsPerPage);
			this.invalidate();
		}
	};
	return instance;
}

export default createArrayDataProvider;
