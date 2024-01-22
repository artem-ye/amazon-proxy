const { connect, close } = require('../../src/core/db/db');

it('DB connecting without err', async () => {
	try {
		await connect();
		await close();
	} catch (err) {
		expect(err).toEqual('error');
	}
});
