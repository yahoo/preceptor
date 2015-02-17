var expect = require('chai').expect;

describe('Group', function () {

	beforeEach(function () {
		var Plugin = require('../../../../lib/taskDecorator/group');
		this.instance = new Plugin();
	});

	// This feature is used to turn array-literals into parallel running tasks
	describe('_processWhenArray', function () {

		it('should ignore when not array', function () {
			var options = { test1: 22 },
				result;

			result = this.instance._processWhenArray(options);

			expect(result).to.be.deep.equals(options);
		});

		it('should create group-task with array-literal', function () {
			var options = [ { test1: 22 } ],
				result;

			result = this.instance._processWhenArray(options);

			expect(result).to.be.deep.equals({
				type: "group",
				configuration: {
					parallel: true,
					tasks: options
				}
			});
		});
	});

	// This feature is only there for convenience
	describe('_processWhenObject', function () {

		it('should ignore when not object', function () {
			var options = [{ test1: 22 }],
				result;

			result = this.instance._processWhenObject(options);

			expect(result).to.be.deep.equals(options);
		});

		it('should ignore object with "type" property', function () {
			var options = { type: 22 },
				result;

			result = this.instance._processWhenObject(options);

			expect(result).to.be.deep.equals(options);
		});

		it('should create group-task with object', function () {
			var options = { test1: { inner_test: 87 } },
				result;

			result = this.instance._processWhenObject(options);

			expect(result).to.be.deep.equals([{
				"type": "group",
				"name": "test1",
				"title": "test1",
				"suite": true,
				"configuration": {
					"parallel": false,
					"tasks": { inner_test: 87 }
				}
			}]);
		});

		it('should create multiple group-tasks with object', function () {
			var options = { test1: { inner_test: 87 }, test2: [ 34,56 ] },
				result;

			result = this.instance._processWhenObject(options);

			expect(result).to.be.deep.equals([
				{
					"type": "group",
					"name": "test1",
					"title": "test1",
					"suite": true,
					"configuration": {
						"parallel": false,
						"tasks": { inner_test: 87 }
					}
				},
				{
					"type": "group",
					"name": "test2",
					"title": "test2",
					"suite": true,
					"configuration": {
						"parallel": false,
						"tasks": [ 34,56 ]
					}
				}
			]);
		});
	});

	describe('run', function () {

		it('should ignore primitives', function () {
			var options = 21,
				result;

			result = this.instance.run(options);

			expect(result).to.be.deep.equals(options);
		});

		it('should create group-task from array-literal', function () {
			var options = [ { test1: 22 } ],
				result;

			result = this.instance.run(options);

			expect(result).to.be.deep.equals({
				type: "group",
				configuration: {
					parallel: true,
					tasks: options
				}
			});
		});

		it('should create group-tasks from object', function () {
			var options = { test1: { inner_test: 87 }, test2: [ 34,56 ] },
				result;

			result = this.instance.run(options);

			expect(result).to.be.deep.equals([
				{
					"type": "group",
					"name": "test1",
					"title": "test1",
					"suite": true,
					"configuration": {
						"parallel": false,
						"tasks": { inner_test: 87 }
					}
				},
				{
					"type": "group",
					"name": "test2",
					"title": "test2",
					"suite": true,
					"configuration": {
						"parallel": false,
						"tasks": [ 34,56 ]
					}
				}
			]);
		});
	});
});


