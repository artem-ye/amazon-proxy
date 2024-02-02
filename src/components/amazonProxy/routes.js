const { AxiosError } = require('axios');
const AmazonProxyService = require('./amazonProxyService/AmazonProxyService');

const handler = (opts) => async (req, res) => {
	const { body, url, method } = req;

	const { prefix } = opts;
	const prefixLessUrl = url.substr(prefix.length);

	try {
		const { data } = await req.api.request({
			url: prefixLessUrl,
			body,
			headers: {
				accept: 'application/json',
				connection: 'keep-alive',
			},
			method,
		});
		return data;
	} catch (err) {
		handleError(err, res);
	}
};

const authPreHandler = async (req, res) => {
	const { client_id = '', client_secret = '' } = req.headers || {};
	const api = new AmazonProxyService();

	try {
		const authRes = await api.authorize({ client_id, client_secret });
		if (authRes instanceof Error) {
			res.code(401).send({
				error: authRes.message,
			});
		}

		req.api = api;
	} catch (err) {
		handleError(err, res);
	}
};

const handleError = (err, res) => {
	let errObj;
	let statusCode = 500;

	if (err instanceof AxiosError) {
		const { data, status, message } = err.response;
		errObj = {
			error: 'External service error',
			error_data: {
				data,
				status,
				message,
				request: err.config,
			},
		};

		statusCode = err.response.status;
	} else {
		errObj = {
			error: 'Internal server error',
			error_data: {
				message: err.message,
			},
		};
	}

	res.code(statusCode).send(errObj);
};

function amazonProxyRouter(fastify, opts, done) {
	fastify.decorateRequest('api', '');
	fastify.addHook('preHandler', authPreHandler);

	fastify.get('/*', handler(opts));
	fastify.post('/*', handler(opts));
	done();
}

module.exports = amazonProxyRouter;
