import FactoryRegistry from 'dojo-widgets/FactoryRegistry';
import Promise from 'dojo-shim/Promise';
import {
	FactoryRegistryInterface,
	WidgetBaseFactory, FactoryRegistryItem
} from 'dojo-widgets/interfaces';

export default class DelegatingFactoryRegistry extends FactoryRegistry {
	protected parent: FactoryRegistryInterface;

	constructor(parent?: FactoryRegistryInterface) {
		super();

		this.parent = parent;
	}

	has(factoryLabel: string): boolean {
		if (!super.has(factoryLabel)) {
			return this.parent.has(factoryLabel);
		}
		return true;
	}

	define(factoryLabel: string, registryItem: FactoryRegistryItem): void {
		this.registry.set(factoryLabel, registryItem);
	}

	get(factoryLabel: string): WidgetBaseFactory | Promise<WidgetBaseFactory> | null {
		if (!super.has(factoryLabel)) {
			if (this.parent) {
				return this.parent.get(factoryLabel);
			}
			return null;
		}
		return super.get(factoryLabel);
	}
}
