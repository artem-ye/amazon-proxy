const amazonTokensService = require('../../amazonTokens.service');
const AmazonOAuthApiClient = require('../api/AmazonOAuthApiClient');
const AmazonSPApiClient = require('../api/AmazonSPApiClient');

const createApiClientService = (
	token_id,
	{ oauthClientProps = {}, apiClientProps = {} } = {}
) => {
	const getCredentials = async () => {
		return amazonTokensService.getCredentials(token_id);
	};

	const saveTokens = async (tokens) => {
		return amazonTokensService.setTokens(token_id, tokens);
	};

	const authService = new AmazonOAuthApiClient({
		getCredentials,
		saveTokens,
		...oauthClientProps,
	});

	return new AmazonSPApiClient({ authService, ...apiClientProps });
};

module.exports = createApiClientService;
