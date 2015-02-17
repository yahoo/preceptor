var sinon = require('sinon');

describe('Task-Decorators', function () {

	beforeEach(function () {
		this.sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		this.sandbox.reset();
	});

	require('./abstract');

	require('./plugins');
});
