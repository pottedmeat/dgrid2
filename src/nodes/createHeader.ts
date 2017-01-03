import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import { DgridNodeOptions, DgridNode } from '../createDgrid';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { HeaderViewOptions } from './createHeaderView';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export type HeaderOptions = DgridNodeOptions<null, null>;

export type Header = DgridNode<null, null>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override(<Partial<Header>> {
		tagName: 'div',
		classes: ['dgrid-header', 'dgrid-header-row'],
		listeners: <VNodeListeners> {
			onclick: function(ev: MouseEvent) {
				console.log('header', this, arguments);
			}
		},
		nodeAttributes: [
			function () {
				const {
					scrollbarSize: { width: scrollbarWidth }
				} = this.properties;

				return {
					role: 'row',
					style: 'right:' + scrollbarWidth + 'px'
				};
			}
		],
		getChildrenNodes: function (this: Header) {
			return [
				w('dgrid-header-view', <HeaderViewOptions> {
					parent: this,
					properties: create(this.properties, null)
				})
			];
		}
	});
