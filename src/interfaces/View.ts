interface View<T> {
	domNode?: HTMLElement;
	render: T;
}

export default View;
