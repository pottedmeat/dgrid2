import Dgrid, { Column } from '../Dgrid';

interface Renderer {
	viewForGrid<T>(grid: Dgrid, header: any, body: any, view?: T): T;
	headerForGrid<T>(grid: Dgrid, columns: Column[], cells: { [key: string]: any }, view?: T): T;
	bodyForGrid<T>(grid: Dgrid, view?: T): T;
}

export default Renderer;
