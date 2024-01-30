const { default: axios } = require('axios');
const AxiosMockAdapter = require('axios-mock-adapter');

const db = require('../_mock/testDb');
const AmazonTokensModel = require('../../src/core/db/models/AmazonTokens.model');
const createApiClientService = require('../../src/services/amazonProxyService/helpers/createApiClientService');

const TOKEN_EXPIRED_STATUS = 403;
const API_ENDPOINT = '/api';
const OAUTH_ENDPOINT = '/auth';
let api;
let mockAuthApiClient, mockApiClient;
let mockTokens;

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

	api = createApiClientService(mockTokens._id, {
		oauthClientProps,
		apiClientProps,
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

	expect(api).toBeDefined();
});

describe('request', () => {
	it('request: simple request works', async () => {
		const REQUEST_DATA = {
			hello: 'world',
		};
		const RESPONSE_DATA = {
			hi: 'world',
		};

		const url = `${API_ENDPOINT}/foo`;

		mockApiClient.onPost(url, REQUEST_DATA).reply(200, RESPONSE_DATA);
		const response = await api.request({
			method: 'post',
			headers: { foo: 'bar' },
			url,
			body: REQUEST_DATA,
		});

		expect(response.data).toMatchObject(RESPONSE_DATA);
		expect(mockApiClient.history.post.length).toBe(1);
	});

	it('request: expired token should be refreshed', async () => {
		const REQUEST_DATA = {
			hello: 'world',
		};
		const RESPONSE_DATA = {
			hi: 'world',
		};

		const url = `${API_ENDPOINT}/bar`;
		mockApiClient.onPost(url, REQUEST_DATA).replyOnce(TOKEN_EXPIRED_STATUS);
		mockApiClient.onPost(url, REQUEST_DATA).replyOnce(200, RESPONSE_DATA);

		const REFRESH_TOKEN_RESPONSE_DATA = {
			access_token: 'new',
			refresh_token: 'new',
			expires_in: 3600,
			token_type: 'Bearer',
		};
		mockAuthApiClient
			.onPost(OAUTH_ENDPOINT)
			.reply(200, REFRESH_TOKEN_RESPONSE_DATA);

		const response = await api.request({
			method: 'post',
			headers: { foo: 'bar' },
			url,
			body: REQUEST_DATA,
		});

		expect(response.data).toMatchObject(RESPONSE_DATA);
		expect(mockAuthApiClient.history.post.length).toBe(1);
		expect(mockApiClient.history.post.length).toBe(2);
	});
});

it('login: should update db correctly', async () => {
	const RESPONSE_DATA = {
		access_token: 'login_access_t',
		refresh_token: 'login_refresh_t',
		expires_in: 3600,
		token_type: 'Bearer',
	};

	mockAuthApiClient.onPost(OAUTH_ENDPOINT).reply(200, RESPONSE_DATA);
	await api.login();

	expect(mockAuthApiClient.history.post.length).toBe(1);
	const newDbTokens = await AmazonTokensModel.findById(mockTokens._id);
	expect(newDbTokens.tokens).toMatchObject(RESPONSE_DATA);
});
