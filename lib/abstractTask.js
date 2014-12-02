// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var logger = require('log4js').getLogger(__filename);
var Promise = require('promise');
var _ = require('underscore');
var uuid = require('uuid');

var defaultTask = require('./defaults/defaultTask');

/**
 * @class AbstractTask
 * @extends Base
 *
 * @property {ReportManager} _reportManager
 * @property {object} _plugins
 * @property {object} _options
 * @property {object} _config
 * @property {Collector} _coverageCollector
 */
var AbstractTask = Base.extend(

	/**
	 * Abstract task constructor
	 *
	 * @param {object} config
	 * @param {Collector} coverageCollector
	 * @param {ReportManager} reportManager
	 * @param {object} plugins
	 * @param {object} plugins.taskDecorator
	 * @param {object} plugins.clientDecorator
	 * @param {object} plugins.task
	 * @param {object} options
	 * @constructor
	 */
	function (config, coverageCollector, reportManager, plugins, options) {
		this.__super();

		this._config = config;
		this._coverageCollector = coverageCollector;
		this._reportManager = reportManager;
		this._plugins = plugins;
		this._options = utils.deepExtend({}, [defaultTask, plugins.sharedOptions || {}, options || {}]);

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
		 * Validates the given data
		 *
		 * @method validate
		 */
		validate: function () {
			if (!_.isObject(this.getOptions())) {
				throw new Error('The options parameter is not an object.');
			}
			if (!_.isObject(this.getConfiguration())) {
				throw new Error('The "configuration" parameter is not an object.');
			}
			if (!_.isObject(this.getDecorators())) {
				throw new Error('The "decorators" parameter is not an object.');
			}
			if (!_.isString(this.getType())) {
				throw new Error('The "type" parameter is not a string.');
			}
			if (!_.isString(this.getTaskId())) {
				throw new Error('The "taskId" parameter is not a string.');
			}
			if (!_.isString(this.getName())) {
				throw new Error('The "name" parameter is not a string.');
			}
			if (!_.isString(this.getTitle())) {
				throw new Error('The "title" parameter is not a string.');
			}
			if (!_.isBoolean(this.isSuite())) {
				throw new Error('The "suite" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.isActive())) {
				throw new Error('The "active" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.isVerbose())) {
				throw new Error('The "verbose" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.shouldReport())) {
				throw new Error('The "report" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.shouldEchoStdOut())) {
				throw new Error('The "echoStdOut" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.shouldEchoStdErr())) {
				throw new Error('The "echoStdErr" parameter is not a boolean.');
			}
		},

		/**
		 * Augments the data with default values
		 *
		 * @method augment
		 */
		augment: function () {
			// Nothing yet
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
		 * Gets the client configuration
		 *
		 * @method getConfiguration
		 * @return {object}
		 */
		getConfiguration: function () {
			return this.getOptions().configuration;
		},

		/**
		 * Gets the decorator list
		 *
		 * @method getDecorators
		 * @return {object[]}
		 */
		getDecorators: function () {
			return this.getOptions().decorators;
		},

		/**
		 * Gets the global configuration
		 *
		 * @method getGlobalConfig
		 * @returns {Object}
		 */
		getGlobalConfig: function () {
			return this._config;
		},

		/**
		 * Gets the coverage collector
		 *
		 * @method getCoverageCollector
		 * @returns {Collector}
		 */
		getCoverageCollector: function () {
			return this._coverageCollector;
		},

		/**
		 * Gets the type of the preceptor task
		 *
		 * @method getType
		 * @return {string}
		 */
		getType: function () {
			return this.getOptions().type;
		},

		/**
		 * Gets a unique id for the task
		 *
		 * @method getTaskId
		 * @return {string}
		 */
		getTaskId: function () {
			return this.getOptions().taskId;
		},

		/**
		 * Gets the name of the preceptor task
		 *
		 * @method getName
		 * @return {string}
		 */
		getName: function () {
			return this.getOptions().name;
		},

		/**
		 * Gets the title of the preceptor task
		 *
		 * @method getTitle
		 * @return {string}
		 */
		getTitle: function () {
			return this.getOptions().title;
		},

		/**
		 * Run tasks in a suite?
		 *
		 * @method isSuite
		 * @return {boolean}
		 */
		isSuite: function () {
			return this.getOptions().suite;
		},

		/**
		 * Is the task in debug-mode?
		 *
		 * @method inDebug
		 * @return {boolean}
		 */
		inDebug: function () {
			return this.getOptions().debug;
		},

		/**
		 * Is the task active?
		 *
		 * @method isActive
		 * @return {boolean}
		 */
		isActive: function () {
			return this.getOptions().active;
		},

		/**
		 * Is the task verbose?
		 *
		 * @method isVerbose
		 * @return {boolean}
		 */
		isVerbose: function () {
			return this.getOptions().verbose;
		},

		/**
		 * Should report?
		 *
		 * @method shouldReport
		 * @return {boolean}
		 */
		shouldReport: function () {
			return this.getOptions().report;
		},

		/**
		 * Should collect coverage?
		 *
		 * @method shouldCollectCoverage
		 * @return {boolean}
		 */
		shouldCollectCoverage: function () {
			return this.getOptions().coverage;
		},

		/**
		 * Echo std-out output of child-process?
		 *
		 * @method shouldEchoStdOut
		 * @return {boolean}
		 */
		shouldEchoStdOut: function () {
			return this.getOptions().echoStdOut;
		},

		/**
		 * Echo std-err output of child-process?
		 *
		 * @method shouldEchoStdErr
		 * @return {boolean}
		 */
		shouldEchoStdErr: function () {
			return this.getOptions().echoStdErr;
		},


		/**
		 * Gets all plugins
		 *
		 * @method getPlugins
		 * @return {object}
		 */
		getPlugins: function () {
			return this._plugins;
		},

		/**
		 * Gets all options-decorator plugins
		 *
		 * @method getTaskDecoratorPlugins
		 * @return {AbstractTaskDecorator[]}
		 */
		getTaskDecoratorPlugins: function () {
			return _.values(this.getPlugins().taskDecorator);
		},

		/**
		 * Gets all client-decorator plugins
		 *
		 * @method getClientDecoratorPlugins
		 * @return {object[]}
		 */
		getClientDecoratorPlugins: function () {
			return this.getPlugins().clientDecorator;
		},

		/**
		 * Gets a specific task plugin
		 *
		 * @method getTaskPlugin
		 * @param {string} name
		 * @return {AbstractTask}
		 */
		getTaskPlugin: function (name) {
			return this.getPlugins().task[name.toLowerCase()];
		},


		/**
		 * Gets the report manager
		 *
		 * @method getReportManager
		 * @return {ReportManager}
		 */
		getReportManager: function () {
			return this._reportManager;
		},


		/**
		 * Gets the label of the task
		 *
		 * @method getLabel
		 * @return {string}
		 */
		getLabel: function () {
			return this.getName() + '-' + this.getTaskId();
		},


		/**
		 * Run the task
		 *
		 * @method run
		 * @param {string} parentId
		 * @return {Promise}
		 */
		run: function (parentId) {

			var suiteId = parentId,
				promise;

			if (this.isActive()) {

				// Should task be wrapped in a suite? Start it
				if (this.isSuite()) {
					suiteId = 'group-' + uuid.v4(); // Generate unique-id
					this.getReportManager().message().suiteStart(suiteId, parentId, this.getTitle());
				}

				// Run task
				promise = this._run(suiteId);

				// Should tasks be wrapped in a suite? Finish it up
				if (this.isSuite()) {
					promise = promise.then(function () {
						this.getReportManager().message().suiteEnd(suiteId);
					}.bind(this), function (err) {
						this.getReportManager().message().suiteEnd(suiteId);
						throw err;
					}.bind(this));
				}

				return promise;

			} else {
				logger.debug('Skip task since it is inactive. ' + this.getLabel());
				return Promise.resolve();
			}
		},

		/**
		 * Run the task
		 *
		 * @method _run
		 * @param {string} parentId
		 * @return {Promise}
		 * @private
		 */
		_run: function (parentId) {
			throw new Error('Unimplemented task function "run".');
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractTask'
	});

module.exports = AbstractTask;
