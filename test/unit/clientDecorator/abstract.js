var chai = require("chai");
var sinonChai = require("sinon-chai");

var helpers = require('../helpers');

var expect = chai.expect;

chai.use(sinonChai);

function testProcess (name) {

	it(name + ' should return a promise', function () {
		var result = this.instance[name]();
		expect(result.then).to.be.not.undefined;
	});
}

describe('Abstract', function () {

	beforeEach(function () {
		this.Class = require('../../../lib/abstractClientDecorator');
	});

	describe('Initialization', function () {

		describe('Simple', function () {

			beforeEach(function () {
				this.instance = new this.Class(this.eventReporter);
			});

			helpers.addBaseTests(function () {
				return this.instance;
			});

			it('should return the options as an object', function () {
				expect(this.instance.getOptions()).to.be.an("object");
			});

			it('should set default options', function () {
				expect(this.instance.getOptions()).to.be.deep.equals({
					type: null,
					configuration: {}
				});
			});

			it('should return the configuration', function () {
				expect(this.instance.getConfiguration()).to.be.deep.equals({});
			});

			it('should have hooked into the eventReporter', function () {
				expect(this.eventReporter.on).to.be.called;
				expect(this.eventReporter.on).to.be.calledWith('message');
				expect(this.eventReporter.on.getCall(0).args[1]).to.be.a('function');
			});
		});

		describe('Custom', function () {

			beforeEach(function () {
				this.options = {
					type: 'test1',
					configuration: {
						entry: 23
					}
				};
				this.instance = new this.Class(this.eventReporter, this.options);
			});

			it('should return the options', function () {
				expect(this.instance.getOptions()).to.be.deep.equals(this.options);
			});

			it('should return the configuration', function () {
				expect(this.instance.getConfiguration()).to.be.deep.equals(this.options.configuration);
			});
		});
	});

	describe('Usage', function () {

		beforeEach(function () {
			this.instance = new this.Class(this.eventReporter, null);
		});

		it('should return the eventReporter', function () {
			expect(this.instance.getEventReporter()).to.be.equal(this.eventReporter);
		});

		testProcess('processBefore');
		testProcess('processAfter');
		testProcess('processBeforeTest');
		testProcess('processAfterTest');

		describe('Events', function () {

			beforeEach(function () {

				// Guard assertion
				expect(this.eventReporter.on).to.be.called;

				this.triggerFunction = this.eventReporter.on.getCall(0).args[1]; // Set in initialize
				this.instance.messageTest = this.sandbox.spy();
			});

			it('should call defined event functions', function () {
				this.triggerFunction.call(this.instance, "areaTest", "messageTest", [1, 2]);
				expect(this.instance.messageTest).to.be.calledOnce;
				expect(this.instance.messageTest.getCall(0).args).to.be.deep.equals([1, 2]);
			});

			it('should not call undefined event functions', function () {
				this.triggerFunction.call(this.instance, "unknownAreaTest", "unknownMessageTest", [1, 2]);
				expect(this.instance.messageTest).to.not.be.called;
			});
		});
	});

});
