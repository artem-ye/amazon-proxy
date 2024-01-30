const { default: axios, AxiosError } = require('axios');

const API_ENDPOINT = 'https://sellingpartnerapi-eu.amazon.com';

class AmazonSPApiClient {
	constructor(options = {}) {
		this.client = options.client || axios.create();
		this.api_endpoint = options.api_endpoint || API_ENDPOINT;

		this.authService = options.authService;
		this.#validateAuthService();

		this.client.interceptors.request.use(
			async (config) => {
				const { access_token } =
					await this.authService.getCredentials();
				if (!access_token) {
					return config;
				}

				const newConfig = {
					headers: {},
					...config,
				};

				newConfig.headers['x-amz-access-token'] = access_token;
				return newConfig;
			},
			(err) => Promise.reject(err)
		);

		this.client.interceptors.response.use(
			(res) => res,
			async (err) => {
				if (
					!(err instanceof AxiosError) ||
					err.response.status !== 403 ||
					err.config.retry
				) {
					throw err;
				}

				await this.authService.refreshToken();
				const newConfig = {
					...err.config,
					retry: true,
				};
				return this.client(newConfig);
			}
		);
	}

	async request(request) {
		const { url, method, headers, body: data } = request;

		const reqConfig = {
			baseURL: this.api_endpoint,
			url,
			method,
			data,
			headers,
		};

		return await this.client.request(reqConfig);
	}

	async login() {
		return this.authService.login();
	}

	#validateAuthService() {
		if (typeof this.authService.getCredentials !== 'function') {
			throw new Error(
				'options.authService.getCredentials must be a function'
			);
		}
		if (typeof this.authService.login !== 'function') {
			throw new Error('options.authService.login must be a function');
		}
	}
}

module.exports = AmazonSPApiClient;
