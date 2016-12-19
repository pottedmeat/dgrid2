import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import { mixin } from '../util';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'div',
		classes: ['dgrid-header', 'dgrid-header-row'],
		listeners: {
			onclick: function(ev: MouseEvent) {
				console.log('header', this, arguments);
			}
		},
		nodeAttributes: [
			function () {
				return {
					role: 'row'
				};
			}
		],
		getChildrenNodes: function () {
			return [
				w('dgrid-header-view', <any> {
					parent: this,
					state: mixin({}, this.state)
				})
			];
		}
	});
