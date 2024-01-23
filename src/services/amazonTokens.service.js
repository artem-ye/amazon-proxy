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
	getTokens: async (_id) => {
		if (!_id || !ObjectId.isValid(_id)) return null;

		const res = await TokensModel.findById(_id);
		return res.toObject()?.tokens || null;
	},
	setTokens: async (_id, tokens) => {
		const record = await TokensModel.findById(_id);

		if (!record) {
			throw new Error(`setTokens error: record _id ${_id} not exists`);
		}

		record.tokens = tokens;
		await record.save();
	},
	findAll: async () => {
		const res = await TokensModel.find({});
		return res;
	},
};

module.exports = amazonTokensService;
