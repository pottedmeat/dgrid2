import Dgrid, { DgridProperties } from '../Dgrid';
import Renderer from './Renderer';

export default function createGrid(domNode: HTMLElement, props: DgridProperties) {
	const grid = new Dgrid(domNode, props);
	grid.renderer = new Renderer();
	return grid;
}
