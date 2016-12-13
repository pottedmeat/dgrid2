import createProjector, { Projector } from 'dojo-widgets/createProjector';
import d from 'dojo-widgets/d';
import createDgrid from './createDgrid';

const createApp = createProjector.mixin({
	mixin: {
		getChildrenNodes: function(this: Projector): any {
			return [
				d(createDgrid, <any> { id: 'grid', state: { id: 'grid' } })
			];
		}
	}
});

const app = createApp();

app.append().then(() => {
	console.log('grid attached');
});
