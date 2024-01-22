const { Schema, model } = require('mongoose');

const tokensSchema = new Schema({
	access_token: { type: String, required: true },
	refresh_token: { type: String, required: true },
	token_type: { type: String, required: true },
	expires_in: { type: Number, required: true },
});

const schema = new Schema({
	client_id: { type: String, required: true, unique: true, index: 1 },
	client_secret: { type: String, required: true },
	tokens: tokensSchema,
});

const CredentialsModel = model('Credentials', schema);

module.exports = CredentialsModel;
