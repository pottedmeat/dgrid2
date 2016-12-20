import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { DgridNodeOptions, DgridNode} from '../createDgrid';
import { w, v } from 'dojo-widgets/d';
import { create } from 'dojo-core/lang';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { RowOptions } from './createRow';

interface HasData {
	data: any[];
};

export type BodyOptions = DgridNodeOptions<null, null>;

export type Body = DgridNode<HasData, null>;

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override(<Partial<Body>> {
		tagName: 'div',
		classes: ['dgrid-scroller'],
		getChildrenNodes: function (this: Body) {
			const {
				collection
			} = this.properties;
			const {
				data = []
			} = this.state;

			collection.fetch().then((results: any[]) => {
				this.state.data = results;
				this.invalidate();
			});

			return [ v('div.dgrid-content', {},
				data.map(item => {
					const id = collection.identify(item)[0];

					return w('dgrid-row', <RowOptions> {
						id,
						parent: this,
						properties: create(this.properties, {
							itemIdentifier: id,
							item
						})
					});
				})
			) ];
		}
	});
