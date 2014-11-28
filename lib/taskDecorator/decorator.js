// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTaskDecorator = require('../abstractTaskDecorator');

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

			if (taskOptions.decorator) {
				taskOptions.decorators = taskOptions.decorator;
				delete taskOptions.decorator;
			}
		}
	});

module.exports = DecoratorTaskDecorator;
