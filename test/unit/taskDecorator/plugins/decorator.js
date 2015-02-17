var expect = require('chai').expect;

describe('Decorator', function () {

	beforeEach(function () {
		var Plugin = require('../../../../lib/taskDecorator/decorator');
		this.instance = new Plugin();
	});

	it('should not modify options', function () {
		var options;

		options = {
			test: 34,
			decorators: {
				another: 67
			}
		};

		this.instance.run(options);

		expect(options).to.be.deep.equals({
			test: 34,
			decorators: {
				another: 67
			}
		});
	});

	it('should modify options', function () {
		var options;

		options = {
			test: 34,
			decorator: {
				another: 67
			}
		};

		this.instance.run(options);

		expect(options).to.be.deep.equals({
			test: 34,
			decorators: {
				another: 67
			}
		});
	});
});

