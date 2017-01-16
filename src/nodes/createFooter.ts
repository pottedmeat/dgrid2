import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';
import delegatingFactoryRegistryMixin from '../mixins/delegatingFactoryRegistryMixin';

export interface DgridFooterProperties extends WidgetProperties {}

export interface DgridFooterFactory extends ComposeFactory<Widget<DgridFooterProperties>, WidgetOptions<WidgetState, DgridFooterProperties>> {}

export default createWidgetBase
	.mixin(delegatingFactoryRegistryMixin)
	.override({
		tagName: 'div',
		classes: [ 'dgrid-footer' ],
		diffProperties(): string[] {
			return [];
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		}
	});
