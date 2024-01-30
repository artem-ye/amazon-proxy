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
	isLoggedIn: async (id) => {
		if (!id) return false;

		const res = await TokensModel.findById(id);
		if (!res) return false;

		return !!(res.tokens?.access_token && res.tokens?.refresh_token);
	},
	getCredentials: async (id) => {
		if (!id) return null;

		const record = await TokensModel.findById(id);
		if (!record) return null;

		const { client_id, client_secret } = record;
		const { access_token, refresh_token } = record?.tokens || {};

		return {
			client_id,
			client_secret,
			access_token,
			refresh_token,
		};
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

		record.tokens = { ...tokens };
		await record.save();
	},
	findAll: async () => {
		const res = await TokensModel.find({});
		return res;
	},
};

module.exports = amazonTokensService;
