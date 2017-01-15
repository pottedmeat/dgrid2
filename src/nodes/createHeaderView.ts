import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns, HasSort, SortTarget, SortEvent, HasSortEvent } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { sortedColumn } from '../util';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';
import { Column } from '../models/createColumn';

export interface DgridHeaderViewProperties extends WidgetProperties {}

export interface DgridHeaderViewFactory extends ComposeFactory<Widget<DgridHeaderViewProperties>, WidgetOptions<WidgetState, DgridHeaderViewProperties>> {}

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
	.mixin({
		mixin: {
			getHeaderCellProperties(column: Column): any {
				const {
					registry,
					properties: {
						sort,
						onSortEvent
					}
				} = this;

				return {
					id: column.id,
					registry,
					column,
					sort: sortedColumn(column, sort),
					onSortEvent
				};
			}
		}
	})
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
			const columns = (<HasColumns> this.properties).columns;

			return [ v('tr', {},
				columns.map(column => {
					return w('dgrid-header-cell', this.getHeaderCellProperties(column));
				})
			) ];
		}
	});
