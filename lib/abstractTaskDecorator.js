// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var logger = require('log4js').getLogger(__filename);

var defaultTaskDecorator = require('./defaults/defaultTaskDecorator');

/**
 * @class AbstractTaskDecorator
 * @extends Base
 *
 * @property {object} _options
 */
var AbstractTaskDecorator = Base.extend(

	/**
	 * Abstract task-decorator constructor
	 *
	 * @param {object} options
	 * @constructor
	 */
	function (options) {
		this.__super();

		this._options = utils.deepExtend({}, [defaultTaskDecorator, options || {}]);
		logger.debug('Construct options', this._options);

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 */
		initialize: function () {
			// Nothing by default
		},


		/**
		 * Gets the options
		 *
		 * @method getOptions
		 * @return {object}
		 */
		getOptions: function () {
			return this._options;
		},


		/**
		 * Run the decorator
		 *
		 * @method run
		 * @param {object} taskOptions
		 * @param {int} taskIndex
		 * @return {void|object|object[]}
		 */
		run: function (taskOptions, taskIndex) {
			throw new Error('Unimplemented decorator function "run".');
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractTaskDecorator'
	});

module.exports = AbstractTaskDecorator;
