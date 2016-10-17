import createGrid from './maquette/createGrid';

const div = document.createElement('div');
document.body.appendChild(div);
createGrid(div, {
	columns: [
		{
			id: 'age',
			label: 'Age'
		},
		{
			id: 'gender',
			label: 'Gender'
		},
		{
			id: 'location',
			label: 'Location'
		}
	]
});
