import { ComposeFactory } from 'dojo-compose/compose';
import { Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';
import createViewNode from './nodes/createViewNode';

export interface DgridState extends WidgetState {
}

interface DgridOptions extends WidgetOptions<DgridState> { }

export type Dgrid = Widget<DgridState>;

interface DgridFactory extends ComposeFactory<Dgrid, DgridOptions> { };

const createDgrid: DgridFactory = createWidgetBase.override({
	render: function() {
		return createViewNode({
			state: {
				grid: this
			}
		}).render();
	}
});

export default createDgrid;
