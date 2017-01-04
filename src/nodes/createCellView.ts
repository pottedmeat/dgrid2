import createWidgetBase from 'dojo-widgets/createWidgetBase';

export default createWidgetBase
	.override({
		diffProperties(): string[] {
			return [];
		},
		getChildrenNodes: function() {
			const {
				item,
				column
			} = this.properties;

			const value = item[column.field];
			return value ? [ '' + item[column.field] ] : [];
		}
	});
