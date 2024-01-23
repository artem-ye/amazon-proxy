const Fastify = require('fastify');
const amazonProxyRouter = require('../../components/amazonProxy/routes');

class HttpServer {
	constructor({ logger = false, port = 3000, host = '127.0.0.1' }) {
		this.logger = logger;
		this.port = port;
		this.host = host;
		this.instance = this.build();
	}

	build() {
		const instance = new Fastify({ logger: this.logger });
		instance.register(amazonProxyRouter, { prefix: '/api/amazon' });
		return instance;
	}

	async start() {
		const { port, host } = this;
		await this.instance.listen({ port, host });
	}

	async ready() {
		return this.instance.ready();
	}

	close() {
		return this.instance.close();
	}
}

module.exports = HttpServer;
