import createWidgetBase from 'dojo-widgets/createWidgetBase';

export default createWidgetBase
	.override({
		tagName: 'div',
		classes: [ 'dgrid-sort-arrow', 'ui-icon' ],
		nodeAttributes: [
			function () {
				return {
					role: 'presentation'
				};
			}
		],
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function () {
			return [ ' ' ];
		}
	});
