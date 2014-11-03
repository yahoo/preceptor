// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTaskDecorator = require('../abstractTaskDecorator');

/**
 * @class IdentifierTaskDecorator
 * @extends AbstractTaskDecorator
 * @constructor
 *
 * @property {Driver} _instance
 */
var IdentifierTaskDecorator = AbstractTaskDecorator.extend(

	{
		/**
		 * Run the decorator
		 *
		 * @method run
		 * @param {object} taskOptions
		 * @param {int} taskIndex
		 */
		run: function (taskOptions, taskIndex) {

			taskOptions.taskId = "task_" + taskIndex;
			if (!taskOptions.name) {
				taskOptions.name = taskOptions.taskId;
			}
			if (!taskOptions.title) {
				taskOptions.title = taskOptions.name;
			}
		}
	});

module.exports = IdentifierTaskDecorator;
