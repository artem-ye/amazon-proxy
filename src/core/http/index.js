const config = require('../../../config/config');
const Server = require('./server');

async function httpServer() {
	const logger = !!config.logging;
	const port = parseInt(config.http.port, 10);
	const host = config.http.host;

	const server = new Server({ logger, port, host });
	await server.start();
	return server.instance;
}

module.exports = httpServer;
