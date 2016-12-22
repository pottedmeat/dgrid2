import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { w } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { DgridNodeOptions, HasItemIdentifier, DgridNode, HasItem } from '../createDgrid';
import { RowViewOptions } from './createRowView';
import watchedPropertyComparisonMixin from '../mixins/watchedPropertyComparisonMixin';

export type RowOptions = DgridNodeOptions<null, HasItemIdentifier & HasItem>;

export type Row = DgridNode<HasItemIdentifier, HasItemIdentifier & HasItem>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin(watchedPropertyComparisonMixin)
	.override({
		watchedProperties: [ 'itemIdentifier' ]
	})
	.override(<Partial<Row>> {
		classes: [ 'dgrid-row' ],
		nodeAttributes: [
			function () {
				return {
					role: 'row'
				};
			}
		],
		applyChangedProperties: function(previousProperties: HasItemIdentifier, currentProperties: HasItemIdentifier) {
			this.state.itemIdentifier = currentProperties.itemIdentifier;
		},
		getChildrenNodes: function (this: Row) {
			return [
				w('dgrid-row-view', <RowViewOptions> {
					parent: this,
					properties: create(this.properties, null)
				})
			];
		}
	});
