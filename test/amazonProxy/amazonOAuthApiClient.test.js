const AmazonOAuthApiClient = require('../../src/services/amazonProxyService/api/AmazonOAuthApiClient');
const { default: axios } = require('axios');
const MockAdapter = require('axios-mock-adapter');

const API_ENDPOINT = '/';
let api;
let mockClient;
let mockCredentials;

beforeEach(() => {
	const client = axios.create();
	mockClient = new MockAdapter(client);

	mockCredentials = {
		client_id: 'auth_cl_id',
		client_secret: 'auth_cl_secret',
		access_token: 'auth_access_token',
		refresh_token: 'auth_refresh_token',
	};

	const options = {
		api_endpoint: API_ENDPOINT,
		client,
		getCredentials: () => mockCredentials,
		saveTokens: (data) => {
			Object.assign(mockCredentials, { ...data });
		},
	};
	api = new AmazonOAuthApiClient(options);
});

describe('login', () => {
	it('correct login request should works', async () => {
		const { client_id, client_secret } = mockCredentials;
		const LOGIN_REQUEST_PARAMS = {
			grant_type: 'client_credentials',
			scope: 'sellingpartnerapi::notifications',
			client_id,
			client_secret,
		};

		const LOGIN_RESPONSE_BODY = {
			access_token: 'new_auth_access_token',
			refresh_token: 'new_auth_refresh_token',
			token_type: 'bearer',
			expires_in: 3600,
		};

		mockClient.onPost(API_ENDPOINT).reply(200, LOGIN_RESPONSE_BODY);

		await api.login();

		expect(mockClient.history.post[0].params).toMatchObject(
			LOGIN_REQUEST_PARAMS
		);
		expect(mockCredentials).toMatchObject(LOGIN_RESPONSE_BODY);
	});

	it.todo('incorrect login request should fail');
});

describe('refreshToken', () => {
	it('correct refreshToken request should works', async () => {
		const { client_id, client_secret, refresh_token } = mockCredentials;
		const REQUEST_PARAMS = {
			grant_type: 'refresh_token',
			client_id,
			client_secret,
			refresh_token,
		};

		const RESPONSE_BODY = {
			access_token: 'refresh_auth_access_token',
			refresh_token: 'refresh_auth_refresh_token',
			token_type: 'bearer',
			expires_in: 3600,
		};

		mockClient.onPost(API_ENDPOINT).reply(200, RESPONSE_BODY);
		await api.refreshToken();

		expect(mockClient.history.post[0].params).toMatchObject(REQUEST_PARAMS);
		expect(mockCredentials).toMatchObject(RESPONSE_BODY);
	});

	it('parallel refresh token request calls remote api only once', async () => {
		const { client_id, client_secret, refresh_token } = mockCredentials;
		const REQUEST_PARAMS = {
			grant_type: 'refresh_token',
			client_id,
			client_secret,
			refresh_token,
		};

		const FIRST_RESPONSE_BODY = {
			access_token: 'refresh_auth_access_token',
			refresh_token: 'refresh_auth_refresh_token',
			token_type: 'bearer',
			expires_in: 3600,
		};

		const SECOND_RESPONSE_BODY = {
			access_token: '2',
			refresh_token: '2',
			token_type: 'bearer',
			expires_in: 3600,
		};

		mockClient
			.onPost(API_ENDPOINT)
			.replyOnce(200, FIRST_RESPONSE_BODY)
			.onPost(API_ENDPOINT)
			.replyOnce(200, SECOND_RESPONSE_BODY);

		await Promise.all([
			api.refreshToken(),
			api.refreshToken(),
			api.refreshToken(),
			api.refreshToken(),
		]);

		expect(mockClient.history.post.length).toBe(1);
		expect(mockClient.history.post[0].params).toMatchObject(REQUEST_PARAMS);
		expect(mockCredentials).toMatchObject(FIRST_RESPONSE_BODY);

		mockClient.resetHistory();
		await api.refreshToken();
		expect(mockClient.history.post.length).toBe(1);
		expect(mockCredentials).toMatchObject(SECOND_RESPONSE_BODY);
	});

	it.todo('incorrect refreshToken request should fail');
});
