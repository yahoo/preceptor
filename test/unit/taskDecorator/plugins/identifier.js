var expect = require('chai').expect;

describe('Identifier', function () {

	beforeEach(function () {
		var Plugin = require('../../../../lib/taskDecorator/identifier');
		this.instance = new Plugin();
	});

	it('should set a taskId', function () {
		var options = {};
		this.instance.run(options, 23);

		expect(options).to.have.property('taskId');
		expect(options.taskId).to.be.equals('task_23');
	});

	describe('name', function () {

		it('should use if given', function () {
			var options = {
				name: 'testName'
			};
			this.instance.run(options, 23);

			expect(options.name).to.be.equals('testName');
		});

		it('should set with taskId if none was given', function () {
			var options = {};
			this.instance.run(options, 23);

			expect(options).to.have.property('name');
			expect(options.name).to.be.equals('task_23');
		});
	});

	describe('title', function () {

		it('should use if given', function () {
			var options = {
				title: 'testTitle'
			};
			this.instance.run(options, 23);

			expect(options.title).to.be.equals('testTitle');
		});

		it('should set with taskId if none was given', function () {
			var options = {};
			this.instance.run(options, 23);

			expect(options).to.have.property('title');
			expect(options.title).to.be.equals('task_23');
		});

		it('should set with name if none was given', function () {
			var options = {
				name: 'testName'
			};
			this.instance.run(options, 23);

			expect(options).to.have.property('title');
			expect(options.title).to.be.equals('testName');
		});
	});

	it('should use title and name if given', function () {
		var options = {
			name: 'testName',
			title: 'testTitle'
		};
		this.instance.run(options, 23);

		expect(options).to.have.property('name');
		expect(options.name).to.be.equals('testName');

		expect(options).to.have.property('title');
		expect(options.title).to.be.equals('testTitle');
	});
});

