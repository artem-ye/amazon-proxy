const amazonTokensService = require('../../services/amazonTokens.service');

const getAll = async () => amazonTokensService.findAll();

const create = async (req) => amazonTokensService.create(req.body);

module.exports = {
	getAll,
	create,
};
