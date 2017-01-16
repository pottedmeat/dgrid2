import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns, HasSort, SortTarget, SortEvent, HasSortEvent } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import delegatingFactoryRegistryMixin from '../mixins/delegatingFactoryRegistryMixin';
import { sortedColumn } from '../util';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';
import { Column } from '../models/createColumn';

export interface DgridHeaderViewProperties extends WidgetProperties {}

export type DgridHeader = Widget<DgridHeaderViewProperties>;

export interface DgridHeaderViewFactory extends ComposeFactory<DgridHeader, WidgetOptions<WidgetState, DgridHeaderViewProperties>> {}

function onClick(this: DgridHeader, event: MouseEvent) {
	const {
		properties: {
			onSortEvent
		}
	} = this;

	let target = <SortTarget> event.target;
	while (target.parentElement) {
		if (target.sortable) {
			onSortEvent(<SortEvent> {
				event: event,
				target: target
			});
			return;
		}
		target = target.parentElement;
	}
}

export default createWidgetBase
	.mixin(delegatingFactoryRegistryMixin)
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
