const { default: axios, AxiosError } = require('axios');
const { default: AxiosMockAdapter } = require('axios-mock-adapter');
const AmazonSPApiClient = require('../../src/services/amazonProxyService/api/AmazonSPApiClient');

const API_ENDPOINT = '/api';
const TOKEN_EXPIRED_STATUS = 403;

let authService;
let mockClient;
let api;

beforeEach(() => {
	authService = {
		getCredentials: async () => {},
		login: async () => {},
		refreshToken: async () => {},
	};

	const client = axios.create();
	mockClient = new AxiosMockAdapter(client);

	api = new AmazonSPApiClient({
		client,
		authService,
		api_endpoint: API_ENDPOINT,
	});
});

it('login stub works', async () => {
	authService.login = async () => {
		Promise.resolve();
		return 'hello';
	};

	const res = await api.login();
	expect(res).toMatch('hello');
});

describe('request', () => {
	it('request sends correct data', async () => {
		authService.getCredentials = async () => {
			Promise.resolve();
			return {
				access_token: 'token',
			};
		};

		const POST_DATA = { hello: 'world' };
		const RESPONSE_DATA = { hi: 'world' };

		mockClient
			.onPost(
				`${API_ENDPOINT}/foo`,
				POST_DATA,
				expect.objectContaining({
					foo: 'bar',
					['x-amz-access-token']: 'token',
				})
			)
			.reply(200, RESPONSE_DATA);

		const { data, status } = await api.request({
			method: 'post',
			headers: { foo: 'bar' },
			url: '/foo',
			body: POST_DATA,
		});

		expect(mockClient.history.post.length).toBe(1);
		expect(data).toMatchObject(RESPONSE_DATA);
		expect(status).toEqual(200);
	});

	it('expired token can be refreshed', async () => {
		const credentials = {
			client_id: 'client',
			client_secret: 'secret',
			access_token: 'access_token',
			refresh_token: 'refresh_token',
		};
		authService.getCredentials = async () => credentials;
		authService.refreshToken = async () => {
			credentials.access_token = 'new_access_token';
			credentials.refresh_token = 'new_refresh_token';
			return credentials;
		};

		const POST_DATA = {
			hello: 'world',
		};
		mockClient
			.onPost(`${API_ENDPOINT}/foo`, POST_DATA)
			.replyOnce(TOKEN_EXPIRED_STATUS)
			.onPost(`${API_ENDPOINT}/foo`, POST_DATA)
			.reply(200);

		await api.request({
			method: 'post',
			url: '/foo',
			body: POST_DATA,
		});

		expect(mockClient.history.post.length).toBe(2);
		expect(mockClient.history.post[0].headers).toMatchObject({
			['x-amz-access-token']: 'access_token',
		});
		expect(mockClient.history.post[1].headers).toMatchObject({
			['x-amz-access-token']: 'new_access_token',
		});
	});

	it('failed refresh request not infinity looping', async () => {
		authService.getCredentials = async () => {
			Promise.resolve();
			return {
				access_token: 'token',
			};
		};

		mockClient.onPost(`${API_ENDPOINT}/foo`).reply(TOKEN_EXPIRED_STATUS);
		await api
			.request({
				method: 'post',
				url: '/foo',
			})
			.catch((err) => {
				expect(err instanceof AxiosError);
				expect(err.response.status).toEqual(TOKEN_EXPIRED_STATUS);
			});

		expect(mockClient.history.post.length).toEqual(2);
	});
});

describe('db errors', () => {
	it('request', async () => {
		authService.getCredentials = () => {
			throw new Error('DB Error');
		};

		mockClient.onPost().reply(200);

		await api
			.request({
				method: 'post',
				url: '/foo',
			})
			.catch((err) => {
				expect(err).toBeDefined();
				expect(err instanceof Error).toBe(true);
			});

		expect(mockClient.history.post.length).toBe(0);
	});
});
