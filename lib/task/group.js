// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTask = require('../abstractTask');
var Promise = require('promise');
var utils = require('preceptor-core').utils;
var _ = require('underscore');

var logger = require('../log').getLogger(__filename);

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

			var options,
				tasks;

			logger.trace('Initialize');

			tasks = this.getTasks();
			if (!_.isArray(tasks)) {
				this.getConfiguration().tasks = [tasks];
			}

			options = this.getOptions();
			if (options.failOnError === undefined) {
				options.failOnError = true;
			}

			options.configuration = utils.deepExtend({}, [
				{
					parallel: false,
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
			logger.trace('Validate options');

			this.__super();

			if (!_.isBoolean(this.isParallel())) {
				throw new Error('The "parallel" parameter is not a boolean.');
			}
			if (!_.isArray(this.getTasks())) {
				throw new Error('The "tasks" parameter is not an array.');
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
			return this.getConfiguration().tasks || [];
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
			logger.trace('Apply decorators for group.');
			decoratorList.forEach(function (Decorator) {

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
			logger.debug('Process group tasks.');
			tasks.forEach(function (taskOptions) {

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
					logger.trace('Task started.', taskInstance.getLabel());
					return taskInstance.run(parentId).then(function () {
						logger.trace('Task completed.', taskInstance.getLabel());
					});
				}.bind(this));

				// Fail on execution when error, or just log?
				currentPromise = currentPromise.then(null, function (err) {
					if (this.shouldFailOnError()) {
						throw err;
					} else {
						logger.debug('Swallow error:', err.stack);
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
				logger.trace('Wait for all parallel tasks in group to be done.');
				promise = Promise.all(promiseList).then(function () {
					logger.trace('All parallel tasks in group are done.');
				});
			}

			return promise;
		}
	});

module.exports = GroupTask;
