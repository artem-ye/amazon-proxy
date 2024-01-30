const TokensModel = require('../../src/core/db/models/AmazonTokens.model');
const tokensService = require('../../src/services/amazonTokens.service');
const { connect, close, clear } = require('../_mock/testDb');

const mongoose = require('mongoose');

beforeAll(async () => {
	await connect();
});

beforeEach(async () => {
	await clear();
	await TokensModel.create({
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

describe('getTokens', () => {
	it('unexciting tokens returns null', async () => {
		const res = await tokensService.getTokens('foo');
		expect(res).toBeFalsy();
	});

	it('correct tokens returns', async () => {
		const { _id } = await TokensModel.findOne({
			client_id: 'test_token_id',
		});

		expect(_id).toBeTruthy();
		const res = await tokensService.getTokens(_id);
		expect(res).toMatchObject({
			access_token: 'access',
			refresh_token: 'refresh',
			expires_in: 3000,
			token_type: 'Bearer',
		});
	});
});

describe('setTokens', () => {
	it('tokens correctly updates', async () => {
		const { _id } = await TokensModel.findOne({
			client_id: 'test_token_id',
		});

		await tokensService.setTokens(_id, {
			access_token: 'access_1',
			refresh_token: 'refresh_1',
			expires_in: 3000,
			token_type: 'Bearer',
		});

		const { tokens } = await TokensModel.findById(_id);
		expect(tokens).toMatchObject({
			access_token: 'access_1',
			refresh_token: 'refresh_1',
			expires_in: 3000,
			token_type: 'Bearer',
		});
	});

	it('incorrect data throw error', async () => {
		const invalidId = new mongoose.Types.ObjectId();

		const { _id: validId } = await TokensModel.findOne({
			client_id: 'test_token_id',
		});

		try {
			await tokensService.setTokens(invalidId, {
				access_token: 'access_1',
				refresh_token: 'refresh_1',
				expires_in: 3000,
				token_type: 'Bearer',
			});
			expect('Invalid data does not throw').toMatch('error');
		} catch (err) {
			expect(err).toBeDefined();
		}

		try {
			await tokensService.setTokens(validId, {
				refresh_token: 'refresh_1',
				expires_in: 3000,
				token_type: 'Bearer',
			});
			expect('Invalid data does not throw').toMatch('error');
		} catch (err) {
			expect(err).toBeDefined();
		}
	});

	it('isLoggedIn', async () => {
		const record = await TokensModel.findOne({
			client_id: 'test_token_id',
			client_secret: 'test_token_secret',
		});

		const loggedIn = await tokensService.isLoggedIn(record._id);
		expect(loggedIn).toBeTruthy();

		record.tokens = null;
		await record.save();

		const notLoggedIn = await tokensService.isLoggedIn(record._id);
		expect(notLoggedIn).toBe(false);
	});

	it('getCredentials', async () => {
		const { _id } = await TokensModel.findOne({
			client_id: 'test_token_id',
		});

		const credentials = await tokensService.getCredentials(_id);

		expect(credentials).toMatchObject({
			client_id: 'test_token_id',
			client_secret: 'test_token_secret',
			access_token: 'access',
			refresh_token: 'refresh',
		});
	});
});
