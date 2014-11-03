// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTask = require('../abstractTask');
var logger = require('log4js').getLogger(__filename);
var Promise = require('promise');
var utils = require('preceptor-core').utils;
var _ = require('underscore');

var staticTaskCounter = 0;

/**
 * @class GroupTask
 * @extends AbstractTask
 * @constructor
 */
var GroupTask = AbstractTask.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {

			if (!_.isArray(this.getTasks())) {
				this.getConfiguration().tasks = [this.getTasks()];
			}

			this.getOptions().configuration = utils.deepExtend({}, [
				{
					parallel: false,
					bail: true,
					tasks: []
				},
				this.getConfiguration()
			]);

			this.__super();
		},


		/**
		 * Validates the given data
		 *
		 * @method validate
		 */
		validate: function () {
			this.__super();

			if (!_.isBoolean(this.isParallel())) {
				throw new Error('The "parallel" parameter is not a boolean.');
			}
			if (!_.isArray(this.getTasks())) {
				throw new Error('The "tasks" parameter is not an array.');
			}
			if (!_.isBoolean(this.shouldBail())) {
				throw new Error('The "bail" parameter is not a boolean.');
			}
		},


		/**
		 * Run the tasks in parallel?
		 *
		 * @method isParallel
		 * @return {boolean}
		 */
		isParallel: function () {
			return this.getConfiguration().parallel;
		},

		/**
		 * Gets the tasks assigned to this group
		 *
		 * @method getTasks
		 * @return {object[]}
		 */
		getTasks: function () {
			return this.getConfiguration().tasks;
		},

		/**
		 * Bail execution when encountering the first error
		 *
		 * @method shouldBail
		 * @return {boolean}
		 */
		shouldBail: function () {
			return this.getConfiguration().bail;
		},


		/**
		 * Applies all decorators
		 *
		 * @method applyTaskDecorators
		 * @param {object[]} tasks
		 * @param {AbstractTaskDecorator[]} decoratorList
		 * @return {object[]}
		 */
		applyTaskDecorators: function (tasks, decoratorList) {

			var decoratorInstance,
				resultTasks,
				localTasks = tasks,
				i;

			// Process all decorators
			_.each(decoratorList, function (Decorator) {

				decoratorInstance = new Decorator();

				// Process all tasks
				for(i = 0; i < localTasks.length; i++) {

					resultTasks = decoratorInstance.run(localTasks[i], i + staticTaskCounter);

					if (_.isArray(resultTasks)) {
						localTasks = localTasks.slice(0, i).concat(resultTasks, localTasks.slice(i + 1));
						i += resultTasks.length - 1;
					} else if (_.isObject(resultTasks)) {
						localTasks[i] = resultTasks;
					}
				}

			}, this);
			staticTaskCounter += localTasks.length;

			return localTasks;
		},


		/**
		 * Run the client
		 *
		 * @method _run
		 * @param {string} parentId
		 * @return {Promise}
		 * @private
		 */
		_run: function (parentId) {

			var promise = Promise.resolve(),
				promiseList = [],
				tasks;

			// Apply all decorator to get final list of tasks
			tasks = this.applyTaskDecorators(this.getTasks(), this.getTaskDecoratorPlugins());
			if (tasks.length === 0) {
				throw new Error('A group without tasks. ' + this.getLabel())
			}

			// Process each task
			_.each(tasks, function (taskOptions) {

				var TaskClass,
					taskInstance,
					currentPromise;

				// Find plugin
				TaskClass = this.getTaskPlugin(taskOptions.type);
				if (!TaskClass) {
					throw new Error('Unknown task: ' + taskOptions.type + ', ' + this.getLabel());
				}

				// Create task instance
				taskInstance = new TaskClass(
					this.getGlobalConfig(),
					this.getCoverageCollector(),
					this.getReportManager(),
					this.getPlugins(),
					taskOptions
				);

				// Run task
				currentPromise = promise.then(function () {
					logger.debug('Task started.', taskInstance.getLabel());
					return taskInstance.run(parentId).then(function () {
						logger.debug('Task completed.', taskInstance.getLabel());
					});
				}.bind(this));

				// Bail on execution when error or just log?
				currentPromise = currentPromise.then(null, function (err) {
					if (this.shouldBail()) {
						throw err;
					} else {
						logger.error('Error', err.stack.toString());
					}
				}.bind(this));

				// Run in parallel?
				if (this.isParallel()) {
					logger.debug('Run task in parallel.', taskInstance.getLabel());
					promiseList.push(currentPromise);
				} else {
					logger.debug('Run task sequential.', taskInstance.getLabel());
					promise = currentPromise;
				}

			}, this);

			// Wait for all to finish?
			if (this.isParallel()) {
				promise = Promise.all(promiseList);
			}

			return promise;
		}
	});

module.exports = GroupTask;
