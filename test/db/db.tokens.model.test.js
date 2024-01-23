const AmazonTokensModel = require('../../src/core/db/models/AmazonTokens.model');
const { connect, close, clear } = require('../_mock/testDb');

beforeAll(async () => {
	await connect();
});

afterAll(async () => {
	await clear();
	await close();
});

describe('CredentialsModel', () => {
	test('Can create credentials entry', async () => {
		await AmazonTokensModel.create({
			client_id: 'test',
			client_secret: 'test',
		});

		const res = await AmazonTokensModel.find({ client_id: 'test' });
		expect(res).toBeTruthy();
		expect(res.length).toEqual(1);
		expect(res[0].toObject()).toMatchObject({
			client_id: 'test',
			client_secret: 'test',
		});

		await AmazonTokensModel.deleteMany({ client_id: 'test' });
	});

	test('Empty fields not allowed', async () => {
		try {
			await AmazonTokensModel.create({
				client_id: 'test_fields_validation',
				client_secret: '',
			});
			expect('Fields validation should throw').toBeFalsy();
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});

	test('Non uniq client_id not allowed', async () => {
		await AmazonTokensModel.create({
			client_id: 'test_duplicated',
			client_secret: 'test_duplicated',
		});

		try {
			await AmazonTokensModel.create({
				client_id: 'test_duplicated',
				client_secret: 'test_duplicated',
			});
			expect('test_Duplicated record should throws').toBeFalsy();
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});
});

describe('CredentialsModel / Tokens', () => {
	test('Can create credentials with tokens', async () => {
		await AmazonTokensModel.create({
			client_id: 'test_with_token',
			client_secret: 'test',
			tokens: {
				access_token: 'access',
				refresh_token: 'refresh',
				expires_in: 3000,
				token_type: 'Bearer',
			},
		});

		const res = await AmazonTokensModel.find({
			client_id: 'test_with_token',
		});
		expect(res).toBeTruthy();
		expect(res.length).toEqual(1);
		expect(res[0].toObject()).toMatchObject({
			client_id: 'test_with_token',
			client_secret: 'test',
			tokens: {
				access_token: 'access',
				refresh_token: 'refresh',
				expires_in: 3000,
				token_type: 'Bearer',
			},
		});
	});
});
