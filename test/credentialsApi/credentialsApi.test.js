const ROOT_TOKEN = '12345';
process.env.ROOT_TOKEN = ROOT_TOKEN;
const config = require('../../config/config');
const AmazonTokensModel = require('../../src/core/db/models/AmazonTokens.model');

const HttpServer = require('../../src/core/http/server');
const mockDb = require('../_mock/testDb');

const server = new HttpServer({});
const fastify = server.instance;

beforeAll(async () => {
	await fastify.ready();
	await mockDb.connect();

	await AmazonTokensModel.create({
		client_id: 'credentials_test_1',
		client_secret: 'credentials_test_secret_1',
		tokens: {
			access_token: '123',
			refresh_token: '345',
			token_type: 'blablabla',
			expires_in: 300,
		},
	});

	await AmazonTokensModel.create({
		client_id: 'credentials_test_2',
		client_secret: 'credentials_test_secret_2',
	});
});

afterAll(async () => {
	await fastify.close();
	mockDb.close();
});

it('Mock token set correctly', () => {
	expect(config.credentials_api.root_token).toBe(ROOT_TOKEN);
});

it('login with invalid credentials not allowed', async () => {
	const res = await fastify.inject({
		method: 'GET',
		url: '/api/credentials',
		headers: {},
	});

	expect(res.statusCode).toBe(401);
});

describe('api', () => {
	it('get / should return all tokens', async () => {
		const res = await fastify.inject({
			method: 'GET',
			url: '/api/credentials',
			headers: {
				Authorization: ROOT_TOKEN,
			},
		});

		expect(res.statusCode).toBe(200);
		const body = JSON.parse(res.body);
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBe(2);
		expect(body[0]).toMatchObject({
			client_id: 'credentials_test_1',
			client_secret: 'credentials_test_secret_1',
			tokens: {
				access_token: '123',
				refresh_token: '345',
				token_type: 'blablabla',
				expires_in: 300,
			},
		});
	});

	it('post / should create new token entry', async () => {
		const POST_DATA = {
			client_id: 'credentials_test_3',
			client_secret: 'credentials_test_secret_3',
			tokens: {
				access_token: '3',
				refresh_token: '3',
				token_type: 'blablabla',
				expires_in: 300,
			},
		};

		const res = await fastify.inject({
			method: 'POST',
			url: '/api/credentials',
			headers: {
				Authorization: ROOT_TOKEN,
			},
			body: POST_DATA,
		});

		expect(res.statusCode).toBe(200);
		const body = JSON.parse(res.body);
		expect(body).toMatchObject(POST_DATA);

		const record = await AmazonTokensModel.findOne({
			client_id: 'credentials_test_3',
			client_secret: 'credentials_test_secret_3',
		});
		expect(record).toMatchObject(POST_DATA);
	});
});
