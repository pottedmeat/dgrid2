import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { DgridNodeOptions, DgridNode} from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { HeaderCellOptions } from './createHeaderCell';
import { VNodeListeners } from 'dojo-widgets/mixins/createVNodeEvented';

export type HeaderViewOptions = DgridNodeOptions<null, null>;

export type HeaderView = DgridNode<null, null>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override(<Partial<HeaderView>> {
		tagName: 'table',
		classes: ['dgrid-row-table'],
		listeners: <VNodeListeners> {
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
		applyChangedProperties: function() {
			// no new state
		},
		getChildrenNodes: function (this: HeaderView) {
			const {
				columns
			} = this.properties;

			return [ v('tr', {},
				columns.map(column => {
					return w('dgrid-header-cell', <HeaderCellOptions> {
						id: column.id,
						parent: this,
						properties: create(this.properties, {
							column: column
						})
					});
				})
			) ];
		}
	});
