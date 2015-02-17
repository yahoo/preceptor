var expect = require('chai').expect;

function testProcess (name) {

	it(name + ' should return a promise', function () {
		var result = this.instance[name]();
		expect(result.then).to.be.not.undefined;
	});
}

function testEvent (name) {

	describe(name, function () {

		it('should have it as function', function () {
			expect(this.instance[name]).to.be.a('function');
		});

		// This is just a simple test to make sure that the call doesn't fail
		// This functionality is already tested on the parent
		it('should not fail', function () {
			this.instance[name]();
		});
	});

}

describe('Plain-Plugin', function () {

	beforeEach(function () {
		var Plugin = require('../../../lib/clientDecorator/plain');
		this.instance = new Plugin(this.eventReporter, {});
	});

	testProcess('processBefore');
	testProcess('processAfter');
	testProcess('processBeforeTest');
	testProcess('processAfterTest');

	testEvent('start');
	testEvent('stop');
	testEvent('complete');
	testEvent('itemData');
	testEvent('itemMessage');
	testEvent('suiteStart');
	testEvent('suiteEnd');
	testEvent('testStart');
	testEvent('testFailed');
	testEvent('testError');
	testEvent('testPassed');
	testEvent('testUndefined');
	testEvent('testSkipped');
	testEvent('testIncomplete');
});

