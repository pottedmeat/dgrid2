import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget, WidgetState } from 'dojo-widgets/interfaces';
import { ColumnsState } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import { mixin } from '../util';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'table',
		classes: ['dgrid-row-table'],
		listeners: {
			onclick: function (ev: MouseEvent) {
				console.log('header view', this, arguments);
			}
		},
		nodeAttributes: [
			function () {
				return {
					role: 'presentation'
				};
			}
		],
		getChildrenNodes: function (this: Widget<WidgetState & ColumnsState>) {
			const {
				columns
			} = this.state;

			return [ v('tr', {},
				columns.map(column => {
					return w('dgrid-header-cell', <any> {
						id: column.id,
						parent: this,
						state: mixin({
							column: column
						}, this.state)
					});
				})
			) ];
		}
	});
