import createColumn, { Column } from './createColumn';

const columnsMap = new Map<string, Column[]>();

export default function createColumns(columns: Column[]) {
	const tokenizedColumns = columns.map(createColumn);
	const key = tokenizedColumns.map((column) => {
		return column.token;
	}).join(',');
	if (!columnsMap.has(key)) {
		columnsMap.set(key, tokenizedColumns);
	}
	return columnsMap.get(key);
}
