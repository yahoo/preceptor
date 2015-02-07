// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTaskDecorator = require('../abstractTaskDecorator');

var logger = require('../log').getLogger(__filename);

/**
 * @class DecoratorTaskDecorator
 * @extends AbstractTaskDecorator
 * @constructor
 *
 * @property {Driver} _instance
 */
var DecoratorTaskDecorator = AbstractTaskDecorator.extend(

	{
		/**
		 * Run the decorator
		 *
		 * @method run
		 * @param {object} taskOptions
		 * @param {int} taskIndex
		 */
		run: function (taskOptions, taskIndex) {

			logger.trace("Run decorator task-decorator (backwards-compatibility)");

			if (taskOptions.decorator) {
				logger.warn("This feature is deprecated. Please use 'decorators' instead of 'decorator'.");
				taskOptions.decorators = taskOptions.decorator;
				delete taskOptions.decorator;
			}
		}
	});

module.exports = DecoratorTaskDecorator;
