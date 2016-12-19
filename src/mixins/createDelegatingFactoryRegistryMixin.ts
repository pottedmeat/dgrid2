import createStateful from 'dojo-compose/bases/createStateful';
import FactoryRegistry from 'dojo-widgets/FactoryRegistry';
import WeakMap from 'dojo-shim/WeakMap';
import { registry } from 'dojo-widgets/d';
import DelegatingFactoryRegistry from '../widgets/DelegatingFactoryRegistry';
import {
    Widget,
    WidgetOptions,
    WidgetState,
    FactoryRegistryInterface
} from 'dojo-widgets/interfaces';

const factoryRegistryWeakMap = new WeakMap<Widget<WidgetState>, FactoryRegistryInterface>();

export interface DelegatingFactoryRegistryMixinState extends WidgetState {
    factoryRegistry?: FactoryRegistryInterface;
}

export interface DelegatingFactoryRegistryMixinOptions extends WidgetOptions<DelegatingFactoryRegistryMixinState> {
    parent?: Widget<WidgetOptions<WidgetState>>;
}

export interface DelegatingFactoryRegistryMixin {
    readonly registry: FactoryRegistryInterface;
}

export default createStateful
    .mixin<DelegatingFactoryRegistryMixin, DelegatingFactoryRegistryMixinOptions>({
        mixin: {
            get registry(this: Widget<WidgetState>): FactoryRegistry {
                return <any> factoryRegistryWeakMap.get(this);
            }
        },
        initialize(instance: Widget<DelegatingFactoryRegistryMixinState>,
            { parent }: DelegatingFactoryRegistryMixinOptions = {}
        ) {
            let factoryRegistry: FactoryRegistryInterface = registry;
            if (parent && parent.registry) {
                factoryRegistry = parent.registry;
            }
            factoryRegistryWeakMap.set(instance, factoryRegistry);
        }
    });