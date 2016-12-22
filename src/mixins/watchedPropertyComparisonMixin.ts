import shallowPropertyComparisonMixin from 'dojo-widgets/mixins/shallowPropertyComparisonMixin';

const diffProperties = shallowPropertyComparisonMixin.mixin.diffProperties;

export interface WatchedPropertyComparisonMixin {
	watchedProperties: string[];
	diffProperties: (previousProperties: any) => string[];
}

const watchedPropertyComparisonMixin: {
	mixin: WatchedPropertyComparisonMixin
} = {
	mixin: {
		watchedProperties: [],
		diffProperties: function (this: {watchedProperties: string[], properties: any}, previousProperties: any) {
			for (let key of this.watchedProperties) {
				this.properties[key] = this.properties[key];
			}
			return diffProperties.call(this, previousProperties);
		}
	}
};

export default watchedPropertyComparisonMixin;
