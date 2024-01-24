const amazonTokensService = require('../amazonTokens.service');

const request = async ({ token_id, body, url, method, headers }) => {
	const tokens = amazonTokensService.getTokens(token_id);

	if (!tokens) {
		// Request new tokens pair
	}
};

module.exports = request;
