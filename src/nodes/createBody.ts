import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { Widget} from 'dojo-widgets/interfaces';
import { DgridState} from '../createDgrid';
import { w, v } from 'dojo-widgets/d';
import { mixin } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';

interface DataState {
	data: any[];
}

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'div',
		classes: ['dgrid-scroller'],
		getChildrenNodes: function (this: Widget<DgridState & DataState>) {
			const {
				columns,
				collection,
				data = []
			} = this.state;

			collection.fetch().then((results: any[]) => {
				this.state.data = results;
				this.invalidate();
			});

			return [ v('div.dgrid-content', {},
				data.map(item => {
					return w('dgrid-row', {
						id: collection.identify(item)[0],
						parent: this,
						state: mixin({
							columns: columns,
							item: item
						}, this.state)
					});
				})
			) ];
		}
	});
