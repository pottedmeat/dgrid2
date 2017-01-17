import createStateful from '@dojo/compose/bases/createStateful';
import FactoryRegistry from '@dojo/widgets/FactoryRegistry';
import WeakMap from '@dojo/shim/WeakMap';
import { registry } from '@dojo/widgets/d';
import DelegatingFactoryRegistry from '../widgets/DelegatingFactoryRegistry';
import {
	Widget,
	WidgetOptions,
	WidgetState,
	FactoryRegistryInterface, WidgetProperties
} from '@dojo/widgets/interfaces';

const factoryRegistryWeakMap = new WeakMap<Widget<WidgetProperties>, FactoryRegistryInterface>();

export interface DelegatingFactoryRegistryMixinState extends WidgetState {
	factoryRegistry?: FactoryRegistryInterface;
}

export interface DelegatingFactoryRegistryMixinOptions extends WidgetOptions<DelegatingFactoryRegistryMixinState, WidgetProperties> {
	registry?: FactoryRegistry;
}

export interface DelegatingFactoryRegistryMixin {
	readonly registry: FactoryRegistryInterface;
}

export default createStateful
	.mixin<DelegatingFactoryRegistryMixin, DelegatingFactoryRegistryMixinOptions>({
		mixin: {
			get registry(this: Widget<WidgetProperties>): FactoryRegistry {
				return <any> factoryRegistryWeakMap.get(this);
			}
		},
		initialize(instance: Widget<WidgetProperties>,
			{ properties: { registry: parentRegistry } }: DelegatingFactoryRegistryMixinOptions = {}
		) {
			let factoryRegistry: FactoryRegistryInterface = registry;
			if (parentRegistry) {
				factoryRegistry = parentRegistry;
			}
			factoryRegistryWeakMap.set(instance, new DelegatingFactoryRegistry(factoryRegistry));
		}
	});
