import { Dgrid } from '../createDgrid';
import { ComposeFactory } from 'dojo-compose/compose';
import { DNode, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';

interface DgridNodeState extends WidgetState {
	grid: Dgrid;
}

interface DgridNodeOptions extends WidgetOptions<DgridNodeState> { }

export type DgridNode = Widget<DgridNodeState>;

interface DgridNodeFactory extends ComposeFactory<Dgrid, DgridNodeOptions> { };

const createDgridNode: DgridNodeFactory = createWidgetBase.mixin({
	mixin: {
		getChildrenNodes: function(this: DgridNode): DNode[] {
			return [];
		}
	}
});

export default createDgridNode;
