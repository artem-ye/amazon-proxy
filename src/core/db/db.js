const config = require('../../../config/config');
const mongoose = require('mongoose');

async function connect(connStr = '') {
	const connectionString = connStr || config.mongo.url;
	return await mongoose
		.connect(connectionString, { serverSelectionTimeoutMS: 500 })
		.then((conn) => {
			const { host, port, name } = conn.connection;
			console.log(`DB Connected: mongodb://${host}:${port}/${name}`);
		});
}

module.exports = {
	connect,
	close: () => mongoose.disconnect(),
};
