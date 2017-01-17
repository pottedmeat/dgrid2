(<any> require).config({
	baseUrl: '../../',
	packages: [
		{ name: 'src', location: '_build/src' },
		{ name: '@dojo', location: 'node_modules/@dojo' },
		{ name: '@dojo/actions', location: 'node_modules/dojo-actions' },
		{ name: '@dojo/app', location: 'node_modules/dojo-app' },
		{ name: '@dojo/dom', location: 'node_modules/dojo-dom' },
		{ name: 'immutable', location: 'node_modules/immutable/dist', main: 'immutable' },
		{ name: 'maquette', location: 'node_modules/maquette/dist', main: 'maquette' },
		{ name: 'rxjs', location: 'node_modules/@reactivex/rxjs/dist/amd' }
	]
});

(<any> require)([ 'src/main' ], function () {});
