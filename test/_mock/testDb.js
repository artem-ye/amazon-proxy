const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

async function connect() {
	mongod = await MongoMemoryServer.create();
	const uri = await mongod.getUri();
	await mongoose.connect(uri);
}

async function close() {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	await mongod.stop();
	mongod = null;
}

async function clear() {
	const collections = mongoose.connection.collections;

	for (const key in collections) {
		const collection = collections[key];
		await collection.deleteMany();
	}
}

module.exports = {
	connect,
	close,
	clear,
};
