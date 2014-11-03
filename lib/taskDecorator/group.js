// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTaskDecorator = require('../abstractTaskDecorator');
var _ = require('underscore');

/**
 * @class GroupTaskDecorator
 * @extends AbstractTaskDecorator
 * @constructor
 *
 * @property {Driver} _instance
 */
var GroupTaskDecorator = AbstractTaskDecorator.extend(

	{
		/**
		 * Run the decorator
		 *
		 * @method run
		 * @param {object} taskOptions
		 * @param {int} taskIndex
		 */
		run: function (taskOptions, taskIndex) {

			taskOptions = this._processWhenArray(taskOptions);
			taskOptions = this._processWhenObject(taskOptions);

			return taskOptions;
		},


		/**
		 * Processes an object without type when one is given
		 *
		 * @method _processWhenObject
		 * @param {object} taskOptions
		 * @return {object}
		 * @private
		 */
		_processWhenObject: function (taskOptions) {

			var newList;

			if (_.isObject(taskOptions) && !taskOptions.type) {

				newList = [];

				_.each(_.keys(taskOptions), function (key) {
					newList.push({
						"type": "group",
						"name": key,
						"suite": true,
						"configuration": {
							"tasks": taskOptions[key]
						}
					})
				});

				taskOptions = newList;
			}

			return taskOptions;
		},

		/**
		 * Processes an array when one is given
		 *
		 * @method _processWhenArray
		 * @param {object|array} taskOptions
		 * @return {object}
		 * @private
		 */
		_processWhenArray: function (taskOptions) {

			if (_.isArray(taskOptions)) {
				taskOptions = {
					"type": "group",
					"configuration": {
						"parallel": true,
						"tasks": taskOptions
					}
				}
			}

			return taskOptions;
		}
	});

module.exports = GroupTaskDecorator;
