const TokensModel = require('../core/db/models/AmazonTokens.model');
const ObjectId = require('mongoose').Types.ObjectId;

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
	getTokensById: async (_id) => {
		if (!_id || !ObjectId.isValid(_id)) return null;

		const res = await TokensModel.findById(_id);
		return res.toObject()?.tokens || null;
	},
	findAll: async () => {
		const res = await TokensModel.find({});
		return res;
	},
};

module.exports = amazonTokensService;
