const config = require('../../../config/config');
const handlers = require('./handlers');

const authPreHandler = (req, res, done) => {
	const ROOT_TOKEN = config.credentials_api.root_token;

	if (!ROOT_TOKEN) {
		res.status(401).send({
			error: 'Root token not set. API disabled',
		});
	}

	const token = req?.headers?.authorization;
	if (token !== ROOT_TOKEN) {
		res.status(401).send({
			error: 'Invalid credentials',
		});
	}

	done();
};

function credentialsApiRoutes(fastify, opts, done) {
	fastify.addHook('preHandler', authPreHandler);

	fastify.get('/', handlers.getAll);
	fastify.post('/', handlers.create);
	done();
}

module.exports = credentialsApiRoutes;
