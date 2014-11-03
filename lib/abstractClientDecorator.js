// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var logger = require('log4js').getLogger(__filename);
var Promise = require('promise');

var defaultClientDecorator = require('./defaults/defaultClientDecorator');

/**
 * @class AbstractClientDecorator
 * @extends Base
 *
 * @property {object} _options
 * @property {EventReporter} _eventReporter
 */
var AbstractClientDecorator = Base.extend(

	/**
	 * Abstract client-decorator constructor
	 *
	 * @param {EventReporter} eventReporter
	 * @param {object} options
	 * @constructor
	 */
	function (eventReporter, options) {
		this.__super();

		this._eventReporter = eventReporter;
		this._options = utils.deepExtend({}, [defaultClientDecorator, options || {}]);
		logger.debug('Construct options', this._options);

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this._eventReporter.on('message', function (areaType, messageType, params) {
				if (this[messageType]) {
					this[messageType].apply(this, params);
				}
			}.bind(this));
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
		 * Gets the client-decorator configuration
		 *
		 * @method getConfiguration
		 * @return {object}
		 */
		getConfiguration: function () {
			return this.getOptions().configuration;
		},


		/**
		 * Gets the event-reporter
		 *
		 * @method getEventReporter
		 * @return {object}
		 */
		getEventReporter: function () {
			return this._eventReporter;
		},


		/**
		 * Processes the begin of the testing environment
		 *
		 * @method processBefore
		 * @return {Promise}
		 */
		processBefore: function () {
			return Promise.resolve();
		},

		/**
		 * Processes the end of the testing environment
		 *
		 * @method processAfter
		 * @return {Promise}
		 */
		processAfter: function () {
			return Promise.resolve();
		},

		/**
		 * Processes the beginning of a test
		 *
		 * @method processBeforeTest
		 * @return {Promise}
		 */
		processBeforeTest: function () {
			return Promise.resolve();
		},

		/**
		 * Processes the ending of a test
		 *
		 * @method processAfterTest
		 * @return {Promise}
		 */
		processAfterTest: function () {
			return Promise.resolve();
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractClientDecorator'
	});

module.exports = AbstractClientDecorator;
