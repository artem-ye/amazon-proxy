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
		tokens: {
			access_token: '123',
			refresh_token: '345',
			token_type: 'foo',
			expires_in: 300,
		},
	});
	await srv.ready();
});

afterAll(async () => {
	await close();
	await fastify.close();
});

test('unauthorized requests not allowed', async () => {
	fastify
		.inject({
			method: 'GET',
			url: '/api/amazon/foo/bar?foo=bar',
		})
		.then((res) => {
			expect(res.statusCode).toBe(401);
		});
});
