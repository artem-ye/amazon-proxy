const { default: axios } = require('axios');

const OAUTH_ENDPOINT = 'https://api.amazon.com/auth/o2/token';

class AmazonOAuthApiClient {
	constructor(options = {}) {
		this.client = options.client || axios.create();
		this.api_endpoint = options.api_endpoint || OAUTH_ENDPOINT;
		const { getCredentials, saveTokens } = options;
		this.db = { getCredentials, saveTokens };
		this.refreshRequest = null;
	}

	async getCredentials() {
		return this.db.getCredentials();
	}

	async login() {
		const { client_id, client_secret } = await this.db.getCredentials();
		this.#validateOauthCredentials({ client_id, client_secret });

		const params = {
			grant_type: 'client_credentials',
			scope: 'sellingpartnerapi::notifications',
			client_id,
			client_secret,
		};
		const data = await this.#oauthRequest(params);
		await this.db.saveTokens(data);
		return data;
	}

	async refreshToken() {
		if (!this.refreshRequest) {
			this.refreshRequest = true;

			const { client_id, client_secret, refresh_token } =
				await this.db.getCredentials();
			this.#validateOauthCredentials({ client_id, client_secret });
			this.#validateOAuthRefreshToken({ refresh_token });

			const params = {
				grant_type: 'refresh_token',
				client_id,
				client_secret,
				refresh_token,
			};

			this.refreshRequest = this.#oauthRequest(params);
		}

		const data = await this.refreshRequest;
		await this.db.saveTokens(data);
		this.refreshRequest = null;
		return data;
	}

	async #oauthRequest(params) {
		const reqConfig = {
			method: 'post',
			maxBodyLength: Infinity,
			url: this.api_endpoint,
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded;charset=UTF-8',
			},
			params,
		};

		const { data, statusText, status } = await this.client.request(
			reqConfig
		);

		if (status !== 200) {
			throw new Error(JSON.stringify({ status, statusText, data }));
		}

		return data;
	}

	#validateOauthCredentials({ client_id, client_secret }) {
		if (!client_id || !client_secret) {
			throw new Error(
				`Invalid credentials client_id: ${client_id} client_secret; ${client_secret}`
			);
		}
	}

	#validateOAuthRefreshToken({ refresh_token }) {
		if (!refresh_token) {
			throw new Error(`Invalid refresh_token ${refresh_token}`);
		}
	}
}

module.exports = AmazonOAuthApiClient;
