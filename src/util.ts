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
