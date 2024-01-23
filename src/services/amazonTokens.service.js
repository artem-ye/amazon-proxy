const TokensModel = require('../core/db/models/AmazonTokens.model');

const amazonTokensService = {
	id: async ({ client_id, client_secret }) => {
		if (!client_id || !client_secret) {
			return null;
		}

		const res = await TokensModel.findOne({
			client_id,
			client_secret,
		});

		return res?._id || null;
	},
	findAll: async () => {
		const res = await TokensModel.find({});
		return res;
	},
};

module.exports = amazonTokensService;
