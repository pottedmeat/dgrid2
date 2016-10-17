import Dgrid, { Column } from '../Dgrid';

interface Customize {
	headerCellForGrid<T>(grid: Dgrid, column: Column, data: any, view?: T): T;
}

export default Customize;
