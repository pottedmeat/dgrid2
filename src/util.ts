import { Column, Sort } from './createDgrid';

function cleanupTestElement(element: HTMLElement) {
	element.className = '';
	if (element.parentNode) {
		document.body.removeChild(element);
	}
}

function getScrollbarDimension(element: HTMLElement, dimension: string) {
	// Used by has tests for scrollbar width/height
	element.className = 'dgrid-scrollbar-measure';
	document.body.appendChild(element);
	const offset: number = (<any> element)['offset' + dimension];
	const client: number = (<any> element)['client' + dimension];
	let size: number = (offset - client);
	cleanupTestElement(element);
	return size;
}

export function getScrollbarSize(element: HTMLElement) {
	return {
		width: getScrollbarDimension(element, 'Width'),
		height: getScrollbarDimension(element, 'Height')
	};
}

export function sortedColumn(column: Column, sorts: Sort[]) {
	if (sorts) {
		for (const sort of sorts) {
			if (sort.property === (column.field || column.id)) {
				return {
					descending: !!sort.descending
				};
			}
		}
	}
}

export function filteredDiffProperties(...keys: string[]) {
	return function(diffProperties: (previousProperties: any) => string[]) {
		return function(previousProperties: any) {
			const filteredProperties: { [key: string]: any } = {};
			for (const key of keys) {
				filteredProperties[key] = previousProperties[key];
			}
			const changedPropertyKeys: string[] = diffProperties.call(this, filteredProperties);
			return changedPropertyKeys.filter((key) => {
				return (keys.indexOf(key) !== -1);
			});
		};
	};
}
