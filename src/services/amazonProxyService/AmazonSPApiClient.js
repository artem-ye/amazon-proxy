const { default: axios } = require('axios');

const API_ENDPOINT = 'https://sellingpartnerapi-eu.amazon.com';

class AmazonSPApiClient {
	constructor(options = {}) {
		this.client = options.client || axios.create();
		this.api_endpoint = options.api_endpoint || API_ENDPOINT;
	}

	async request() {}
}

module.exports = {
	AmazonSPApiClient,
};
