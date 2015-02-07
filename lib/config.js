// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var _ = require('underscore');
var Coverage = require('./coverage.js');

var defaultConfig = require('./defaults/defaultConfig');

var logger = require('./log').getLogger(__filename);

/**
 * @class Config
 * @extends Base
 *
 * @property {object} _options
 */
var Config = Base.extend(

	/**
	 * Config constructor
	 *
	 * @param {object} options
	 * @constructor
	 */
	function (options) {
		logger.trace("Constructor", options);

		this.__super();

		this._options = utils.deepExtend({}, [defaultConfig, options || {}]);
		logger.debug('Loaded configuration:', this._options);

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {

			// Make sure the configuration has the correct structure
			this.validate();

			// Augment options with outside data
			this.augment();
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
		 * Validates the data given
		 *
		 * @method validate
		 */
		validate: function () {

			logger.trace("Validate options");

			if (!_.isObject(this.getOptions())) {
				throw new Error('The options parameter is not an object.');
			}
			if (!_.isBoolean(this.isDebug())) {
				throw new Error('The "debug" option is not a boolean.');
			}
			if (!_.isBoolean(this.isVerbose())) {
				throw new Error('The "verbose" option is not a boolean.');
			}
			if (!_.isObject(this.getReportManager())) {
				throw new Error('The "reportManager" parameter is not an object.');
			}
			if (!_.isArray(this.getReporter())) {
				throw new Error('The "reporter" parameter is not an array.');
			}
			if (!_.isArray(this.getListener())) {
				throw new Error('The "listener" parameter is not an array.');
			}
			if (!_.isArray(this.getPlugins())) {
				throw new Error('The "plugins" parameter is not an array.');
			}
		},

		/**
		 * Augments the data with default values
		 *
		 * @method augment
		 */
		augment: function () {
			logger.trace("Augment options");
			// Nothing yet
		},


		/**
		 * Is application in debug mode?
		 *
		 * Note: In debug mode, the clients are run in the same process.
		 *
		 * @method isDebug
		 * @return {boolean}
		 */
		isDebug: function () {
			return this.getOptions().debug;
		},

		/**
		 * Is application in verbose mode?
		 *
		 * @method isVerbose
		 * @return {boolean}
		 */
		isVerbose: function () {
			return this.getOptions().verbose;
		},

		/**
		 * Gets the report-manager configuration
		 *
		 * @method getReportManager
		 * @return {object}
		 */
		getReportManager: function () {
			return this.getOptions().reportManager;
		},

		/**
		 * Gets the reporter configuration
		 *
		 * @method getReporter
		 * @return {object[]}
		 */
		getReporter: function () {
			return this.getReportManager().reporter;
		},

		/**
		 * Gets the listener configuration
		 *
		 * @method getListener
		 * @return {object[]}
		 */
		getListener: function () {
			return this.getReportManager().listener;
		},

		/**
		 * Gets the coverage options
		 *
		 * @method getCoverage
		 * @return {Coverage}
		 */
		getCoverage: function () {
			return new Coverage(this.getOptions().coverage);
		},

		/**
		 * Gets the plugins configuration
		 *
		 * @method getPlugins
		 * @return {string[]}
		 */
		getPlugins: function () {
			return this.getOptions().plugins;
		},


		/**
		 * Exports data to an object
		 *
		 * @method toObject
		 * @return {object}
		 */
		toObject: function () {
			return utils.deepExtend({}, [this.getOptions(), {
				"coverage": this.getCoverage().toObject()
			}]);
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'Config'
	});

module.exports = Config;
