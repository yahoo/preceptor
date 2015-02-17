var sinon = require('sinon');

describe('Client-Decorators', function () {

	beforeEach(function () {

		this.sandbox = sinon.sandbox.create();

		this.eventReporter = {
			on: this.sandbox.stub()
		};
	});

	afterEach(function () {
		this.sandbox.reset();
	});

	require('./abstract');
	require('./plain');
});
