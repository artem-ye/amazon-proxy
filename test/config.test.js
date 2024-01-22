process.env.HTTP_HOST = '8.8.8.8';
process.env.HTTP_PORT = 5000;
process.env.LOGGING = true;

const config = require('../config/config');

describe('config props sets correctly', () => {
	it('HTTP_HOST', () => {
		expect(config.http.host).toEqual('8.8.8.8');
	});
	it('HTTP_PORT', () => {
		expect(config.http.port).toEqual('5000');
	});
	it('LOGGING', () => {
		expect(config.logging).toBeTruthy();
	});
});
