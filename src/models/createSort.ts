import { assign } from 'dojo-core/lang';

export interface Sort {
	property: string;
	descending: boolean;
}

interface TokenizedSort extends Sort {
	token: number;
}

const sortMap = new Map<string, TokenizedSort>();

export default function createSort(sort: Sort): TokenizedSort {
	const keys = Object.keys(sort).sort();
	const keyValues: [string, any][] = [];
	for (const key of keys) {
		if (key === 'token') {
			// in case an already tokenized sort was passed
			continue;
		}
		keyValues.push([key, (<any> sort)[key]]);
	}
	const key = keyValues.join(',');
	if (!sortMap.has(key)) {
		sortMap.set(key, assign({
			token: sortMap.size
		}, sort));
	}
	return sortMap.get(key);
}
