import { createDgrid, DgridProperties } from '../Dgrid';
import Renderer from './Renderer';

export default function createGrid(options: DgridProperties) {
	const grid = createDgrid(options);
	grid.renderer = new Renderer();
	return grid;
}
