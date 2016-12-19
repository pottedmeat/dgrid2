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

	has(factoryLabel: string): boolean {
		if (!super.has(factoryLabel)) {
			return this.parent.has(factoryLabel);
		}
		return true;
	}

	get(factoryLabel: string): WidgetFactory | Promise<WidgetFactory> | null {
		if (!super.has(factoryLabel)) {
			if (this.parent) {
				return this.parent.get(factoryLabel);
			}
			return null;
		}
		return super.get(factoryLabel);
	}
}
