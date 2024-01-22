require('dotenv').config();

const config = {
	logging: process.env.LOGGING || false,
	http: {
		host: process.env.HTTP_HOST || '127.0.0.1',
		port: process.env.HTTP_PORT || 3000,
	},
	mongo: {
		url: process.env.MONGO_URL || '',
	},
};

module.exports = config;
