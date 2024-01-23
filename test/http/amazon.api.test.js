const HttpServer = require('../../src/core/http/server');
const { connect, close } = require('../_mock/testDb');
const TokensModel = require('../../src/core/db/models/AmazonTokens.model');

const srv = new HttpServer({});
const fastify = srv.instance;

beforeAll(async () => {
	await connect();
	await TokensModel.create({
		client_id: 'test_token_id',
		client_secret: 'test_token_secret',
	});
	await srv.ready();
});

afterAll(async () => {
	await close();
	await fastify.close();
});

test('authorized requests not throws', async () => {
	fastify
		.inject({
			method: 'GET',
			url: '/api/amazon/fuck/off?foo=bar',
			headers: {
				client_id: 'test_token_id',
				client_secret: 'test_token_secret',
			},
		})
		.then((res) => {
			expect(res.statusCode).toBe(200);
			const body = JSON.parse(res.body);
			expect(body.prefix).toMatch('/api/amazon');
			expect(body.url).toMatch('/fuck/off?foo=bar');
		});
});

test('unauthorized requests not allowed', async () => {
	fastify
		.inject({
			method: 'GET',
			url: '/api/amazon/fuck/off?foo=bar',
		})
		.then((res) => {
			expect(res.statusCode).toBe(401);
		});
});
