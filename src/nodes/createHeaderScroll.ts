import createWidgetBase from 'dojo-widgets/createWidgetBase';

export default createWidgetBase
	.override({
		classes: [ 'dgrid-header', 'dgrid-header-scroll', 'dgrid-scrollbar-width' ],
		nodeAttributes: [
			function () {
				const {
					scrollbarSize: { width: scrollbarWidth }
				} = this.properties;

				return {
					style: 'width:' + scrollbarWidth + 'px'
				};
			}
		],
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		}
	});
