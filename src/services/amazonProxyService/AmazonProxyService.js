const amazonTokensService = require('../amazonTokens.service');
const createApiClientService = require('./helpers/createApiClientService');

class AmazonProxyService {
	#api;

	constructor({ createApiClient = createApiClientService }) {
		this.createApi = createApiClient;
	}

	async authorize({ client_id, client_secret }) {
		if (!client_id || !client_secret) {
			throw new Error('Credentials validation error: Invalid data');
		}

		const token_id = await amazonTokensService.id({
			client_id,
			client_secret,
		});
		if (!token_id) {
			throw new Error(
				'Authorization error: Given credentials are not exists'
			);
		}

		this.#api = this.createApi(token_id);

		if (!(await amazonTokensService.isLoggedIn(token_id))) {
			const tokens = await this.#api.login({ client_id, client_secret });
			await amazonTokensService.setTokens(token_id, tokens);
		}

		return token_id;
	}

	async request(request) {
		if (!this.#api) {
			throw new Error('Not authorized');
		}

		return this.#api.request(request);
	}
}

module.exports = AmazonProxyService;
