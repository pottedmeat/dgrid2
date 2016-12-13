import { Dgrid } from '../createDgrid';
import { ComposeFactory } from 'dojo-compose/compose';
import { DNode, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';

export interface DgridNodeState extends WidgetState {
	descendantId?: string;
	grid: Dgrid;
}

export interface DgridNodeOptions extends WidgetOptions<DgridNodeState> { }

export type DgridNode = Widget<DgridNodeState>;

export interface DgridNodeFactory extends ComposeFactory<Dgrid, DgridNodeOptions> { };

const createDgridNode: DgridNodeFactory = createWidgetBase.mixin({
	mixin: {
		getChildDescendants: function (this: DgridNode) {
			const {
				grid,
				descendantId
			} = this.state;
			return grid.getChildDescendants(descendantId);
		},
		getChildrenNodes: function(): DNode[] {
			return this.getChildDescendants();
		}
	}
});

export default createDgridNode;
