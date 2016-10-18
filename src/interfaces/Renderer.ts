import Dgrid, { Column } from '../Dgrid';
import View from './View';

interface Renderer {
	viewForGrid<T extends View<any>>(grid: Dgrid, header: any, body: any, view?: T): T;
	headerForGrid<T extends View<any>>(grid: Dgrid, content: any, view?: T): T;
	headerViewForGrid<T extends View<any>>(grid: Dgrid, columns: Column[], cells: { [key: string]: any }, view?: T): T;
	headerCellForGrid<T extends View<any>>(grid: Dgrid, column: Column, content: any, view?: T): T;
	headerCellViewForGrid?<T extends View<any>>(grid: Dgrid, column: Column, view?: T): T;
	bodyForGrid<T extends View<any>>(grid: Dgrid, rows: any[], view?: T): T;
	rowForGrid<T extends View<any>>(grid: Dgrid, data: any, content: any, view?: T): T;
	rowViewForGrid<T extends View<any>>(grid: Dgrid, data: any, columns: Column[], cells: { [key: string]: any }, view?: T): T;
	cellForGrid<T extends View<any>>(grid: Dgrid, data: any, column: Column, content: any, view?: T): T;
	cellViewForGrid<T extends View<any>>(grid: Dgrid, data: any, column: Column, view?: T): T;
}

export default Renderer;
