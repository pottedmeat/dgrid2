import createWidgetBase from 'dojo-widgets/createWidgetBase';

export default createWidgetBase
	.override({
		tagName: 'span',
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function () {
			const {
				column
			} = this.properties;

			return [ column.label ];
		}
	});
