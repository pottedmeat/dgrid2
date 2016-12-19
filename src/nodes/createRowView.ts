import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnsState } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import { mixin } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'table',
		classes: ['dgrid-row-table'],
		nodeAttributes: [
			function () {
				return {
					role: 'presentation'
				};
			}
		],
		getChildrenNodes: function (this: Widget<WidgetState & ColumnsState>) {
			const {
				columns,
				item
			} = this.state;

			return [ v('tr', {},
				columns.map(column => {
					return w('dgrid-cell', {
						id: column.id,
						parent: this,
						state: mixin({
							column: column,
							item: item
						}, this.state)
					});
				})
			) ];
		}
	});
