import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns, HasSort, SortTarget, SortEvent, HasSortEvent } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { sortedColumn } from '../util';

function onClick(event: MouseEvent) {
	const properties = <HasSortEvent> this.properties;

	let target = <SortTarget> event.target;
	while (target.parentElement) {
		if (target.sortable) {
			properties.onSortEvent(<SortEvent> {
				event: event,
				target: target
			});
			return;
		}
		target = target.parentElement;
	}
}

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.override({
		tagName: 'table',
		classes: ['dgrid-row-table'],
		nodeAttributes: [
			function () {
				return {
					role: 'presentation',
					onclick: onClick,
					bind: this
				};
			}
		],
		diffProperties(previousProperties: HasColumns & HasSort, newProperties: HasColumns & HasSort): string[] {
			const changedPropertyKeys: string[] = [];
			if (previousProperties.columns !== newProperties.columns) {
				changedPropertyKeys.push('columns');
			}
			if (previousProperties.sort !== newProperties.sort) {
				changedPropertyKeys.push('sort');
			}
			return changedPropertyKeys;
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function () {
			const {
				properties,
				registry
			} = this;
			const {
				columns
			} = <HasColumns> properties;

			return [ v('tr', {},
				columns.map(column => {
					return w('dgrid-header-cell', {
						id: column.id,
						registry,
						column,
						sort: sortedColumn(column, properties.sort),
						onSortEvent: properties.onSortEvent
					});
				})
			) ];
		}
	});
