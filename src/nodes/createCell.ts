import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnState } from '../createDgrid';
import { w } from 'dojo-widgets/d';
import { mixin } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
    .mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'td',
		classes: ['dgrid-cell'],
		nodeAttributes: [
			function () {
				return {
					role: 'gridcell'
				};
			}
		],
		getChildrenNodes: function (this: Widget<WidgetState & ColumnState>) {
			return [
				w('dgrid-cell-view', {
					parent: this,
					state: mixin({}, this.state)
				})
			];
		}
	});
