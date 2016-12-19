export const mixin = function(to: any, from: any) {
	from.collection && (to.collection = from.collection);
	from.columns && (to.columns = from.columns);
	from.column && (to.column = from.column);
	from.item && (to.item = from.item);
	return to;
};
