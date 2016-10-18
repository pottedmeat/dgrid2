import Dgrid, { Column } from '../Dgrid';
import View from './View';

interface Customize {
	headerViewForGrid?<T extends View<any>>(grid: Dgrid, columns: Column[], cells: { [key: string]: any }, view?: T): T;
	headerCellViewForGrid?<T extends View<any>>(grid: Dgrid, column: Column, view?: T): T;
	rowViewForGrid?<T extends View<any>>(grid: Dgrid, data: any, columns: Column[], cells: { [key: string]: any }, view?: T): T;
	cellViewForGrid?<T extends View<any>>(grid: Dgrid, data: any, column: Column, view?: T): T;
}

export default Customize;
