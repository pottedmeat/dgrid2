import createWidgetBase from 'dojo-widgets/createWidgetBase';
import { HasColumns } from '../createDgrid';
import { v, w } from 'dojo-widgets/d';
import createDelegatingFactoryRegistryMixin from '../mixins/createDelegatingFactoryRegistryMixin';
import { WidgetProperties, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import { ComposeFactory } from 'dojo-compose/compose';
import { Column } from '../models/createColumn';

export interface DgridRowViewProperties extends WidgetProperties {}

export interface DgridRowViewFactory extends ComposeFactory<Widget<DgridRowViewProperties>, WidgetOptions<WidgetState, DgridRowViewProperties>> {}

export default createWidgetBase
	.mixin(createDelegatingFactoryRegistryMixin)
	.mixin({
		mixin: {
			getCellProperties(column: Column): any {
				const {
					registry,
					properties: {
						item,
						itemIdentifier
					}
				} = this;

				return {
					id: column.id,
					registry,
					column,
					item,
					itemIdentifier
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
					role: 'presentation'
				};
			}
		],
		diffProperties(previousProperties: HasColumns, newProperties: HasColumns): string[] {
			const changedPropertyKeys: string[] = [];
			if (previousProperties.columns !== newProperties.columns) {
				changedPropertyKeys.push('columns');
			}
			return changedPropertyKeys;
		},
		assignProperties(previousProperties: any, newProperties: any) {
			return newProperties;
		},
		getChildrenNodes: function () {
			const columns = (<HasColumns> this.properties).columns;

			return [
				v('tr', {},
					columns.map(column => {
						return w('dgrid-cell', this.getCellProperties(column));
					})
				)
			];
		}
	});
