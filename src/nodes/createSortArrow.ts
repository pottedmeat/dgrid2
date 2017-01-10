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
		getChildrenNodes: function () {
			return [ ' ' ];
		}
	});
