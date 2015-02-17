var chai = require("chai");
var sinonChai = require("sinon-chai");

var helpers = require('../helpers');

var expect = chai.expect;

chai.use(sinonChai);

describe('Abstract', function () {

	beforeEach(function () {
		this.Class = require('../../../lib/abstractTaskDecorator');
	});

	describe('Initialization', function () {

		describe('Simple', function () {

			beforeEach(function () {
				this.instance = new this.Class();
			});

			helpers.addBaseTests(function () {
				return this.instance;
			});

			it('should return the options as an object', function () {
				expect(this.instance.getOptions()).to.be.an("object");
			});

			it('should set default options', function () {
				expect(this.instance.getOptions()).to.be.deep.equals({});
			});
		});

		describe('Custom', function () {

			beforeEach(function () {
				this.options = {
					type: 'test1'
				};
				this.instance = new this.Class(this.options);
			});

			it('should return the options', function () {
				expect(this.instance.getOptions()).to.be.deep.equals(this.options);
			});
		});
	});

	describe('Usage', function () {

		beforeEach(function () {
			this.instance = new this.Class(null);
		});

		it('should throw an exception', function () {
			try {
				this.instance.run();
			} catch (err) {
				return;
			}
			throw Error("Exceptions wasn't thrown");
		});
	});
});
