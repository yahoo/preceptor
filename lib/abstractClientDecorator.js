// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var Promise = require('promise');

var defaultClientDecorator = require('./defaults/defaultClientDecorator');

var logger = require('./log').getLogger(__filename);

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
		logger.trace("Constructor", options);

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
			logger.trace("Initialize");

			this._eventReporter.on('message', function (areaType, messageType, params) {
				logger.trace("Received message: ", areaType, messageType, params);

				if (this[messageType]) {
					logger.trace("Trigger message");
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
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
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
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
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
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
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
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
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
