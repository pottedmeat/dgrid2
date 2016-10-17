interface View<T> {
	domNode: HTMLElement;
	render: T;
	args?: any[];
}

export default View;
