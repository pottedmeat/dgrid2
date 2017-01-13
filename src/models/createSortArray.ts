import createSort, { Sort } from './createSort';

const sortArrayMap = new Map<string, Sort[]>();

export default function createSortArray(sortArray: Sort[]) {
	const tokenizedSortArray = sortArray.map(createSort);
	const key = tokenizedSortArray.map((sort) => {
		return sort.token;
	}).join(',');
	if (!sortArrayMap.has(key)) {
		sortArrayMap.set(key, tokenizedSortArray);
	}
	return sortArrayMap.get(key);
}
