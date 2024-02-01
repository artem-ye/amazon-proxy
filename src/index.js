const HttpServer = require('./core/http');
const db = require('./core/db/db');

const start = async () => {
	await Promise.all([db.connect(), HttpServer()]);
};

start();
