const { default: axios } = require('axios');

const AUTH_ENDPOINT = 'https://api.amazon.com/auth/o2/token';

class AmazonOAuthApiClient {
	constructor(options = {}) {
		this.client = options.client || axios.create();
		this.api_endpoint = options.api_endpoint || AUTH_ENDPOINT;
	}

	async requestTokens({ client_id, client_secret }) {}

	async refreshTokens({ refresh_token }) {}
}

module.exports = AmazonOAuthApiClient;
