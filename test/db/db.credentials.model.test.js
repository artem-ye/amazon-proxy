const { connect, close } = require('../../src/core/db/db');
const CredentialsModel = require('../../src/core/db/models/Credentials.model');

beforeAll(async () => {
	await connect();
});

afterAll(async () => {
	await CredentialsModel.deleteMany({ client_id: 'test' });
	await CredentialsModel.deleteMany({ client_id: 'test_fields_validation' });
	await CredentialsModel.deleteMany({ client_id: 'test_with_token' });
	await CredentialsModel.deleteMany({ client_id: 'test_duplicated' });
	await close();
});

describe('CredentialsModel', () => {
	test('Can create credentials entry', async () => {
		await CredentialsModel.create({
			client_id: 'test',
			client_secret: 'test',
		});

		const res = await CredentialsModel.find({ client_id: 'test' });
		expect(res).toBeTruthy();
		expect(res.length).toEqual(1);
		expect(res[0].toObject()).toMatchObject({
			client_id: 'test',
			client_secret: 'test',
		});

		await CredentialsModel.deleteMany({ client_id: 'test' });
	});

	test('Empty fields not allowed', async () => {
		try {
			await CredentialsModel.create({
				client_id: 'test_fields_validation',
				client_secret: '',
			});

			const res = await CredentialsModel.find({
				client_id: 'test_fields_validation',
			});
			expect('Fields validation should throw').toBeFalsy();
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});

	test('Non uniq client_id not allowed', async () => {
		await CredentialsModel.create({
			client_id: 'test_duplicated',
			client_secret: 'test_duplicated',
		});

		try {
			await CredentialsModel.create({
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
		await CredentialsModel.create({
			client_id: 'test_with_token',
			client_secret: 'test',
			tokens: {
				access_token: 'access',
				refresh_token: 'refresh',
				expires_in: 3000,
				token_type: 'Bearer',
			},
		});

		const res = await CredentialsModel.find({
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
