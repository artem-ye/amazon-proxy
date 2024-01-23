const { connect, close } = require('../../src/core/db/db');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = MongoMemoryServer.create();

afterAll(async () => {
	(await mongod).stop();
});

it('DB connecting without err', async () => {
	const uri = await (await mongod).getUri();

	try {
		await connect(uri);
		await close();
	} catch (err) {
		expect(err).toEqual('error');
	}
});
