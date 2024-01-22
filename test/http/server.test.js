const HttpServer = require('../../src/core/http/server');

it('Server starts without errors', async () => {
	const server = new HttpServer({});

	try {
		server.start();
		const instance = server.instance;
		await server.ready();
		await server.close();
	} catch (err) {
		expect(err).toEqual('err');
	}
});
