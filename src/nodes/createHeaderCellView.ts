import createWidgetBase from 'dojo-widgets/createWidgetBase';

export default createWidgetBase.override({
	getChildrenNodes: function () {
		return [ 'header' ];
	}
});