import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import { mixin } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
    .mixin(createDelegatingFactoryRegistryMixin)
	.override({
		classes: [ 'dgrid-row' ],
		nodeAttributes: [
			function () {
				return {
					role: 'row'
				};
			}
		],
		getChildrenNodes: function () {
			return [
				w('dgrid-row-view', {
					parent: this,
					state: mixin({}, this.state)
				})
			];
		}
	});
