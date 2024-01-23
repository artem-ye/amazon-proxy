const TokensModel = require('../../src/core/db/models/AmazonTokens.model');
const tokensService = require('../../src/services/amazonTokens.service');
const { connect, close } = require('../_mock/testDb');

beforeAll(async () => {
	await connect();
	TokensModel.create({
		client_id: 'test_token_id',
		client_secret: 'test_token_secret',
		tokens: {
			access_token: 'access',
			refresh_token: 'refresh',
			expires_in: 3000,
			token_type: 'Bearer',
		},
	});
});

afterAll(async () => {
	await close();
});

test('id', async () => {
	const res1 = await tokensService.id({
		client_id: '',
		client_secret: 'bar',
	});
	expect(res1).toBeFalsy();

	const res2 = await tokensService.id({
		client_id: 'foo',
		client_secret: '',
	});
	expect(res2).toBeFalsy();

	const res3 = await tokensService.id({});
	expect(res3).toBeFalsy();

	const existUserId = await tokensService.id({
		client_id: 'test_token_id',
		client_secret: 'test_token_secret',
	});

	expect(existUserId).toBeTruthy();
	const findByIdRes = await TokensModel.findById(existUserId);
	expect(findByIdRes).toMatchObject({
		client_id: 'test_token_id',
		client_secret: 'test_token_secret',
	});
});

describe('getTokensById', () => {
	it('unexciting tokens returns null', async () => {
		const res = await tokensService.getTokensById('foo');
		expect(res).toBeFalsy();
	});

	it('correct tokens returns', async () => {
		const { _id } = await TokensModel.findOne({
			client_id: 'test_token_id',
		});

		expect(_id).toBeTruthy();
		const res = await tokensService.getTokensById(_id);
		expect(res).toMatchObject({
			access_token: 'access',
			refresh_token: 'refresh',
			expires_in: 3000,
			token_type: 'Bearer',
		});
	});
});
