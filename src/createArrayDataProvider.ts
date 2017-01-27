import {
	Dgrid,
	ItemProperties,
	SortDetail,
	PaginationDetails,
	RangeDetails,
	DgridProperties
} from './createDgrid';

export interface ArrayDataProviderOptions {
	items: any[];
	idProperty?: string;
	properties?: DgridProperties;
}

function expand(items: any[], idProperty: string, expanded: { [key: string]: any }, until = Infinity, array = <ItemProperties[]> [], parents: any[] = [], parent: string = '', depth = 0) {
	if (!parents.length) {
		for (const item of items) {
			if (item.parent) {
				parents.push(item.parent);
			}
		}
	}

	for (const item of items) {
		if (array.length >= until) {
			return array;
		}

		const id = item[idProperty];
		const isExpanded = expanded[id];
		const canExpand = (parents.indexOf(id) !== -1);
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
					expand(items, idProperty, expanded, until, array, parents, id, depth + 1);
				}
			}
		}
		else if (!item.parent) {
			array.push({
				id,
				isExpanded,
				canExpand,
				data: item
			});
			if (isExpanded) {
				expand(items, idProperty, expanded, until, array, parents, id, depth + 1);
			}
		}
	}
	return array;
}

function createArrayDataProvider(options: ArrayDataProviderOptions): ArrayDataProviderOptions {
	let {
		items,
		idProperty = 'id',
		properties: {
			data: {
				sortDetails  = []
			} = {},
			pagination: {
				itemsPerPage = -1
			} = {}
		} = {}
	} = options;
	const expanded: { [key: string]: any } = {};

	const properties: DgridProperties = options.properties || <any> {};
	properties.data = {
		sortDetails,
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
			return expand(items, idProperty, expanded).length;
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
		onToggleExpandedRequest(item: ItemProperties) {
			expanded[item.id] = !expanded[item.id];
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
	return options;
}

export default createArrayDataProvider;
