const Fastify = require('fastify');

class HttpServer {
	constructor({ logger = false, port = 3000, host = '127.0.0.1' }) {
		this.logger = logger;
		this.port = port;
		this.host = host;
		this.instance = this.build();
	}

	build() {
		return new Fastify({ logger: this.logger });
	}

	async start() {
		const { port, host } = this;
		const msg = await this.instance.listen({ port, host });
	}

	async ready() {
		return this.instance.ready();
	}

	close() {
		return this.instance.close();
	}
}

module.exports = HttpServer;
