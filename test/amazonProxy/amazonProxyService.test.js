const { default: axios, AxiosError } = require('axios');
const AxiosMockAdapter = require('axios-mock-adapter');

const db = require('../_mock/testDb');
const AmazonTokensModel = require('../../src/core/db/models/AmazonTokens.model');
const createApiClientService = require('../../src/services/amazonProxyService/helpers/createApiClientService');
const AmazonProxyService = require('../../src/services/amazonProxyService/AmazonProxyService');

// const TOKEN_EXPIRED_STATUS = 403;
const API_ENDPOINT = '/api';
const OAUTH_ENDPOINT = '/auth';
let mockAuthApiClient, mockApiClient;
let mockTokens;

let service;

beforeAll(async () => {
	await db.connect();
});

afterAll(async () => {
	await db.close();
});

beforeEach(async () => {
	db.clear();
	mockTokens = await AmazonTokensModel.create({
		client_id: 'user',
		client_secret: 'pass',
		tokens: {
			access_token: 'access_t',
			refresh_token: 'refresh_t',
			expires_in: 3600,
			token_type: 'Bearer',
		},
	});

	const authApiClient = axios.create();
	mockAuthApiClient = new AxiosMockAdapter(authApiClient);

	const apiClient = axios.create();
	mockApiClient = new AxiosMockAdapter(apiClient);

	const oauthClientProps = {
		client: authApiClient,
		api_endpoint: OAUTH_ENDPOINT,
	};
	const apiClientProps = {
		client: apiClient,
		api_endpoint: API_ENDPOINT,
	};

	const mockCreateApiClientService = (token_id) => {
		return createApiClientService(token_id, {
			oauthClientProps,
			apiClientProps,
		});
	};
	service = new AmazonProxyService({
		createApiClient: mockCreateApiClientService,
	});
});

it('mock data created', () => {
	expect(mockTokens).toMatchObject({
		client_id: 'user',
		client_secret: 'pass',
		tokens: {
			access_token: 'access_t',
			refresh_token: 'refresh_t',
		},
	});
});

describe('authorize', () => {
	it('authorization with invalid credentials returns error', async () => {
		try {
			await service.authorize({
				client_id: 'foo',
				client_secret: 'bar',
			});
			expect('Error not throws').toBe('Error');
		} catch (e) {
			expect(e instanceof Error).toBe(true);
		}
	});

	it('valid credentials authorized', async () => {
		const { client_id, client_secret } = mockTokens;
		const res = await service.authorize({ client_id, client_secret });
		expect(res instanceof Error).toBe(false);
	});

	it('authorization creates automatic api login request on missing token', async () => {
		const { client_id, client_secret } = mockTokens;
		mockTokens.tokens = null;
		await mockTokens.save();

		const RESPONSE_DATA = {
			access_token: 'login_access_123',
			refresh_token: 'login_refresh_123',
			expires_in: 3600,
			token_type: 'Bearer',
		};
		mockAuthApiClient.onPost(OAUTH_ENDPOINT).reply(200, RESPONSE_DATA);

		const res = await service.authorize({ client_id, client_secret });
		expect(res instanceof Error).toBe(false);

		expect(mockAuthApiClient.history.post.length).toBe(1);
		const newDbTokens = await AmazonTokensModel.findById(mockTokens._id);
		expect(newDbTokens.tokens).toMatchObject(RESPONSE_DATA);
	});

	it('automatic login throw error on remote service error', async () => {
		const { client_id, client_secret } = mockTokens;
		mockTokens.tokens = null;
		await mockTokens.save();
		mockAuthApiClient.onPost(OAUTH_ENDPOINT).reply(401);

		await service.authorize({ client_id, client_secret }).catch((e) => {
			expect(e instanceof AxiosError).toBe(true);
		});

		expect(mockAuthApiClient.history.post.length).toBe(1);
	});
});

describe('request', () => {
	it('unauthorized request failed', async () => {
		const url = `${API_ENDPOINT}/foo`;
		mockApiClient.onPost(url).reply(200);
		await service
			.request({
				method: 'post',
				headers: { foo: 'bar' },
				url,
			})
			.catch((e) => expect(e.message).toMatch('Not authorized'));
		expect(mockApiClient.history.post.length).toBe(0);
	});

	it('request works', async () => {
		// Need authorization before request
		const { client_id, client_secret } = mockTokens;
		const res = await service.authorize({ client_id, client_secret });
		expect(res instanceof Error).toBe(false);

		// Request
		const REQUEST_DATA = {
			hello: 'world',
		};
		const RESPONSE_DATA = {
			hi: 'world',
		};
		const url = `${API_ENDPOINT}/foo`;
		mockApiClient.onPost(url, REQUEST_DATA).reply(200, RESPONSE_DATA);
		const response = await service.request({
			method: 'post',
			headers: { foo: 'bar' },
			url,
			body: REQUEST_DATA,
		});
		expect(response.data).toMatchObject(RESPONSE_DATA);
		expect(mockApiClient.history.post.length).toBe(1);
	});

	it.todo('request with expired tokens');
});
