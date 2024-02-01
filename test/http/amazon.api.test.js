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
	const res = await fastify.inject({
		method: 'GET',
		url: '/api/amazon/fuck/off?foo=bar',
		headers: {
			client_id: 'test_token_id',
			client_secret: 'test_token_secret',
		},
	});

	console.log(res.body);
	expect(res.statusCode).toBe(401);
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
