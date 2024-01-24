const tokensService = require('../../services/amazonTokens.service');

const handler = (opts) => (req) => {
	const { body, url, headers, method } = req;
	const { prefix } = opts;
	const prefixLessUrl = url.substr(prefix.length);

	return { body, url: prefixLessUrl, method, headers };
};

const authPreHandler = async (req, res) => {
	const { client_id, client_secret } = req.headers;

	tokensService
		.id({ client_id, client_secret })
		.then((token_id) => {
			if (token_id) {
				req.token_id = token_id;
				return;
			}

			res.code(401).send({ error: 'unauthorized' });
		})
		.catch((err) => void res.code(500).send({ error: err.message }));
};

function amazonProxyRouter(fastify, opts, done) {
	fastify.decorateRequest('token_id', '');
	fastify.addHook('preHandler', authPreHandler);

	fastify.get('/*', handler(opts));
	done();
}

module.exports = amazonProxyRouter;
