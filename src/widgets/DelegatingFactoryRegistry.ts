import FactoryRegistry from 'dojo-widgets/FactoryRegistry';
import Promise from 'dojo-shim/Promise';
import {
    WidgetFactory,
    FactoryRegistryInterface
} from 'dojo-widgets/interfaces';

export default class DelegatingFactoryRegistry extends FactoryRegistry {
    protected parent: FactoryRegistryInterface;

    constructor(parent?: FactoryRegistryInterface) {
        super();

        this.parent = parent;
    }

    get(factoryLabel: string): WidgetFactory | Promise<WidgetFactory> | null {
        debugger;
        if (!this.has(factoryLabel)) {
            if (this.parent) {
                return this.parent.get.apply(this, arguments);
            }
            return null;
        }
        super.get.apply(this, arguments);
    }
}