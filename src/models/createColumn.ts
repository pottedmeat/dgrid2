import { assign } from '@dojo/core/lang';

export interface Column {
	id: string;
	label: string;
	field?: string;
	sortable?: boolean;
}

interface TokenizedColumn extends Column {
	token: number;
}

const columnMap = new Map<string, TokenizedColumn>();

export default function createColumn(column: Column): TokenizedColumn {
	const keys = Object.keys(column).sort();
	const keyValues: [string, any][] = [];
	for (const key of keys) {
		if (key === 'token') {
			// in case an already tokenized column was passed
			continue;
		}
		keyValues.push([key, (<any> column)[key]]);
	}
	const key = keyValues.join(',');
	if (!columnMap.has(key)) {
		columnMap.set(key, assign({
			token: columnMap.size
		}, column));
	}
	return columnMap.get(key);
}
