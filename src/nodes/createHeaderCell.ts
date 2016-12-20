import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumn, DgridNodeOptions, DgridNode } from '../createDgrid';
import { w } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export type HeaderCellOptions = DgridNodeOptions<null, HasColumn>;

export type HeaderCell = DgridNode<HasColumn, HasColumn>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override(<Partial<HeaderCell>> {
		tagName: 'th',
		classes: ['dgrid-cell'],
		listeners: <VNodeListeners> {
			onclick: function (ev: MouseEvent) {
				console.log('cell', this, arguments);
			}
		},
		nodeAttributes: [
			function () {
				return {
					role: 'columnheader'
				};
			}
		],
		applyChangedProperties: function(previousProperties: HasColumn, currentProperties: HasColumn) {
			this.state.column = currentProperties.column;
		},
		getChildrenNodes: function (this: HeaderCell) {
			return [
				w('dgrid-header-cell-view', <HeaderCellOptions> {
					parent: this,
					properties: create(this.properties, null)
				})
			];
		}
	});
