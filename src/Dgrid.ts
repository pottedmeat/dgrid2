import Scaffolding from './Scaffolding';
import Renderer from './interfaces/Renderer';
import on from 'dojo-core/on';
import Evented from 'dojo-core/Evented';

export interface Column {
	id: string;
	label: string
}

export interface DgridProperties {
	columns: Column[];
}

class Dgrid extends Evented {
	state: {[key: string]: any};
	domNode: HTMLElement;
	renderer: Renderer;
	scaffolding: Scaffolding;

	constructor (domNode: HTMLElement, props: DgridProperties) {
		super();

		this.domNode = domNode;
		this.state = {};
		const scaffolding = this.scaffolding = new Scaffolding();

		scaffolding.add('renderer.viewForGrid');
		scaffolding.add('renderer.headerForGrid', {
			parent: 'renderer.viewForGrid',
			on: 'thead:click'
		});
		scaffolding.add('renderer.bodyForGrid', {
			parent: 'renderer.viewForGrid',
			on: 'tbody:click'
		});
	}

	startup () {
		const scaffolding = this.scaffolding;
		const view = scaffolding.build(this);
		let domNode = this.domNode;
		if (domNode.parentNode) {
			domNode.parentNode.replaceChild(view.domNode, domNode);
			domNode = view.domNode;
			this.domNode = domNode;
		}
		else {
			domNode.appendChild(view.domNode);
		}
		const state = this.state;

		on(this, 'thead:click', (event: MouseEvent) => {
			state['theadFocused'] = !state['theadFocused'];
			console.log('thead focused:', state['theadFocused']);
			scaffolding.build(this);
		});
		on(this, 'tbody:click', (event: MouseEvent) => {
			state['tbodyFocused'] = !state['tbodyFocused'];
			console.log('tbody focused:', state['tbodyFocused']);
			scaffolding.build(this);
		});
	}
}

export default Dgrid;
