const TokensModel = require('../../src/core/db/models/AmazonTokens.model');
const amazonTokensService = require('../../src/services/amazonTokens.service');
const { connect, close } = require('../_mock/testDb');

beforeAll(async () => {
	await connect();
	TokensModel.create({
		client_id: 'test_token_id',
		client_secret: 'test_token_secret',
	});
});

afterAll(async () => {
	await close();
});

test('id', async () => {
	const res1 = await amazonTokensService.id({
		client_id: '',
		client_secret: 'bar',
	});
	expect(res1).toBeFalsy();

	const res2 = await amazonTokensService.id({
		client_id: 'foo',
		client_secret: '',
	});
	expect(res2).toBeFalsy();

	const res3 = await amazonTokensService.id({});
	expect(res3).toBeFalsy();

	const existUserId = await amazonTokensService.id({
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
