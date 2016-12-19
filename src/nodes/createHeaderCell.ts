import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnState } from '../createDgrid';
import { w } from 'dojo-widgets/d';
import { mixin } from '../util';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'th',
		classes: ['dgrid-cell'],
		listeners: {
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
		getChildrenNodes: function (this: Widget<WidgetState & ColumnState>) {
			const {
				column
			} = this.state;

			return [ w('dgrid-header-cell-view', <any> {
				parent: this,
				state: mixin({
					column: column
				}, this.state)
			}) ];
		}
	});
