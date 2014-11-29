// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var ReportManager = require('preceptor-reporter');
var Promise = require('promise');
var _ = require('underscore');
var log4js = require('log4js');
var path = require('path');
var istanbul = require('istanbul');
var mkdirp = require('mkdirp');
var fs = require('fs');

var Config = require('./config');
var GroupTask = require('./task/group');

var defaultShared = require('./defaults/defaultShared');

var logger = log4js.getLogger(__filename);

/**
 * @class PreceptorManager
 * @extends Base
 *
 * @property {object} _options
 * @property {Config} _configuration
 *
 * @property {object} _taskDecoratorList
 * @property {object} _clientDecoratorList
 * @property {object} _taskList
 *
 * @property {ReportManager} _reportManager
 *
 * @property {Collector} _coverageCollector
 */
var PreceptorManager = Base.extend(

	/**
	 * Web-driver server constructor
	 *
	 * @param {object} options
	 * @constructor
	 */
	function (options) {
		this.__super();

		log4js.setGlobalLogLevel('INFO');
		this._options = options || {};

		this._taskDecoratorList = {};
		this._clientDecoratorList = {};
		this._taskList = {};

		this._reportManager = null;

		this._coverageCollector = new istanbul.Collector();

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {

			// Initialize registries
			this._initializeTaskDecoratorRegistry();
			this._initializeClientDecoratorRegistry();
			this._initializeTaskRegistry();

			// Make sure the configuration has the correct structure
			this.validate();

			// Augment options with outside data
			this.augment();

			// Create config object
			this._configuration = new Config(this._options.configuration);
			if (this.getConfig().isVerbose()) {
				log4js.setGlobalLogLevel('DEBUG');
			}

			// Set-up the report-manager
			this._reportManager = new ReportManager(this.getConfig().getReportManager());

			// Load custom plugins
			_.each(this.getConfig().getPlugins(), function (pluginPath) {
				var Plugin = require(pluginPath);

				if (Plugin.loader && _.isFunction(Plugin.loader)) {
					Plugin.loader(this);
				} else {
					throw new Error("The plugin " + pluginPath + " doesn't have a loader.");
				}
			}, this);
		},

		/**
		 * Initializes the options-decorator registry
		 *
		 * @method _initializeTaskDecoratorRegistry
		 * @private
		 */
		_initializeTaskDecoratorRegistry: function () {
			var defaultElements = [
				{ name: 'group', fileName: 'group' },
				{ name: 'identifier', fileName: 'identifier' },
				{ name: 'decorator', fileName: 'decorator' }
			];

			_.each(defaultElements, function (entry) {
				entry.path = path.join(__dirname, 'taskDecorator', entry.fileName);
				entry.fn = require(entry.path);
			}, this);

			this.registerTaskDecoratorRange(defaultElements);
		},

		/**
		 * Initializes the client-decorator registry
		 *
		 * @method _initializeClientDecoratorRegistry
		 * @private
		 */
		_initializeClientDecoratorRegistry: function () {
			var defaultElements = [
				{ name: 'plain', fileName: 'plain' }
			];

			_.each(defaultElements, function (entry) {
				entry.path = path.join(__dirname, 'clientDecorator', entry.fileName);
			}, this);

			this.registerClientDecoratorRange(defaultElements);
		},

		/**
		 * Initializes the task registry
		 *
		 * @method _initializeTaskRegistry
		 * @private
		 */
		_initializeTaskRegistry: function () {
			var defaultElements = [
				{ name: 'cucumber', fileName: 'cucumber' },
				{ name: 'group', fileName: 'group' },
				{ name: 'kobold', fileName: 'kobold' },
				{ name: 'loader', fileName: 'loader' },
				{ name: 'mocha', fileName: 'mocha' },
				{ name: 'node', fileName: 'node' },
				{ name: 'shell', fileName: 'shell' }
			];

			_.each(defaultElements, function (entry) {
				entry.path = path.join(__dirname, 'task', entry.fileName);
				entry.fn = require(entry.path);
			}, this);

			this.registerTaskRange(defaultElements);
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
		 * Gets the configuration object
		 *
		 * @method getConfig
		 * @return {Config}
		 */
		getConfig: function () {
			return this._configuration;
		},

		/**
		 * Gets all the shared options for tasks
		 *
		 * @method getSharedTaskOptions
		 * @return {object}
		 */
		getSharedTaskOptions: function () {
			return this.getOptions().shared || {};
		},

		/**
		 * Gets a list of task options
		 *
		 * @method getTasks
		 * @return {object[]}
		 */
		getTasks: function () {
			return this.getOptions().tasks || [];
		},


		/**
		 * Gets the report-manager
		 *
		 * @method getReportManager
		 * @return {ReportManager}
		 */
		getReportManager: function () {
			return this._reportManager;
		},


		/**
		 * Validate data given
		 *
		 * @method validate
		 */
		validate: function () {
			if (!_.isObject(this.getOptions())) {
				throw new Error('The options parameter is not an object.');
			}
			if (!_.isObject(this.getSharedTaskOptions())) {
				throw new Error('The shared section is not an object.');
			}
			if (!_.isArray(this.getTasks()) && !_.isObject(this.getTasks())) {
				throw new Error('The shared section is not an object or array.');
			}
		},

		/**
		 * Augment data with default values
		 *
		 * @method augment
		 */
		augment: function () {

			// Inject default values
			this.getOptions().shared = utils.deepExtend({}, [defaultShared, this.getSharedTaskOptions()]);
			logger.debug('Augmented options', this._options);
		},


		/**
		 * Gets a dictionary of registered options-decorator
		 *
		 * @method getTaskDecoratorList
		 * @return {object}
		 */
		getTaskDecoratorList: function () {
			return this._taskDecoratorList;
		},

		/**
		 * Checks if a options-decorator is registered
		 *
		 * @method hasTaskDecorator
		 * @param {string} name
		 * @return {boolean}
		 */
		hasTaskDecorator: function (name) {
			return !!this._taskDecoratorList[name.toLowerCase()];
		},

		/**
		 * Gets a specific registered options-decorator
		 *
		 * @method getTaskDecorator
		 * @param {string} name
		 * @return {function}
		 */
		getTaskDecorator: function (name) {
			return this._taskDecoratorList[name.toLowerCase()];
		},

		/**
		 * Registers a options-decorator
		 *
		 * @method registerTaskDecorator
		 * @param {string} name
		 * @param {function} contr
		 */
		registerTaskDecorator: function (name, contr) {
			this._taskDecoratorList[name.toLowerCase()] = contr;
		},

		/**
		 * Registers a list of options-decorators
		 *
		 * @method registerTaskDecoratorRange
		 * @param {object[]} list `{ name: <string>, fn: <function> }`
		 */
		registerTaskDecoratorRange: function (list) {
			_.each(list, function (entry) {
				this.registerTaskDecorator(entry.name, entry.fn);
			}, this);
		},


		/**
		 * Gets a dictionary of registered client-decorator
		 *
		 * @method getClientDecoratorList
		 * @return {object}
		 */
		getClientDecoratorList: function () {
			return this._clientDecoratorList;
		},

		/**
		 * Checks if a client-decorator is registered
		 *
		 * @method hasClientDecorator
		 * @param {string} name
		 * @return {boolean}
		 */
		hasClientDecorator: function (name) {
			return !!this._clientDecoratorList[name.toLowerCase()];
		},

		/**
		 * Gets a specific registered client-decorator
		 *
		 * @method getClientDecorator
		 * @param {string} name
		 * @return {function}
		 */
		getClientDecorator: function (name) {
			return this._clientDecoratorList[name.toLowerCase()];
		},

		/**
		 * Registers a client-decorator
		 *
		 * @method registerClientDecorator
		 * @param {string} name
		 * @param {string} path
		 */
		registerClientDecorator: function (name, path) {
			this._clientDecoratorList[name.toLowerCase()] = path;
		},

		/**
		 * Registers a list of client-decorators
		 *
		 * @method registerClientDecoratorRange
		 * @param {object[]} list `{ name: <string>, path: <string> }`
		 */
		registerClientDecoratorRange: function (list) {
			_.each(list, function (entry) {
				this.registerClientDecorator(entry.name, entry.path);
			}, this);
		},


		/**
		 * Gets a dictionary of registered tasks
		 *
		 * @method getTaskList
		 * @return {object}
		 */
		getTaskList: function () {
			return this._taskList;
		},

		/**
		 * Checks if a task is registered
		 *
		 * @method hasTask
		 * @param {string} name
		 * @return {boolean}
		 */
		hasTask: function (name) {
			return !!this._taskList[name.toLowerCase()];
		},

		/**
		 * Gets a specific registered task
		 *
		 * @method getTask
		 * @param {string} name
		 * @return {function}
		 */
		getTask: function (name) {
			return this._taskList[name.toLowerCase()];
		},

		/**
		 * Registers a task
		 *
		 * @method registerTask
		 * @param {string} name
		 * @param {function} contr
		 */
		registerTask: function (name, contr) {
			this._taskList[name.toLowerCase()] = contr;
		},

		/**
		 * Registers a list of task
		 *
		 * @method registerTaskRange
		 * @param {object[]} list `{ name: <string>, fn: <function> }`
		 */
		registerTaskRange: function (list) {
			_.each(list, function (entry) {
				this.registerTask(entry.name, entry.fn);
			}, this);
		},


		/**
		 * Run the preceptor application
		 *
		 * @method run
		 * @return {Promise}
		 */
		run: function () {
			var promise = Promise.resolve(),
				config = this.getConfig(),
				reportManager = this.getReportManager(),
				coverageCollector = this._coverageCollector,
				eventReporter;

			logger.debug('Shared', this.getSharedTaskOptions());
			logger.debug('Config', config.toObject());
			logger.debug('Tasks', this.getTasks());

			logger.debug('Create reporter');
			eventReporter = reportManager.addReporter("Event"); // Needed to forward it to the client-decorator
			reportManager.addReporterRange(config.getReporter());
			reportManager.addListenerRange(config.getListener());

			// Output events from reporter
			eventReporter.on('message', function (areaType, messageType, params) {
				logger.debug('Event-Reporter: [' + areaType + '] ' + messageType, params);
			});

			// Start reporter
			reportManager.message().start();

			// Run task
			promise = promise.then(function () {

				var task = new GroupTask(config, coverageCollector, reportManager, {
					taskDecorator: this.getTaskDecoratorList(),
					clientDecorator: this.getClientDecoratorList(),
					task: this.getTaskList(),
					sharedOptions: this.getSharedTaskOptions()
				}, {
					type: 'group',
					taskId: 'root-task',
					name: 'Root Task',
					title: 'Preceptor',
					configuration: {
						parallel: false,
						tasks: this.getTasks()
					}
				});
				return task.run(undefined);

			}.bind(this));

			// Stop reporter before leaving
			promise = promise.then(function () {
				reportManager.message().stop();
				reportManager.message().complete();
				if (this.getConfig().getCoverage().isActive()) {
					this._writeCoverage(this.getConfig().getCoverage());
				}
			}.bind(this), function (err) {
				reportManager.message().stop();
				reportManager.message().complete();
				if (this.getConfig().getCoverage().isActive()) {
					this._writeCoverage(this.getConfig().getCoverage());
				}
				throw err;
			}.bind(this));

			return promise;
		},

		/**
		 * Write the coverage report collected
		 *
		 * @method _writeCoverage
		 * @param {object} coverageConfiguration
		 * @private
		 */
		_writeCoverage: function (coverageConfiguration) {
			var istanbulOverride, istanbulConfiguration, reporter, reportingDir, coverageFile, coverage, reports;

			// Setup configuration
			istanbulOverride = {
				"instrumentation": {
					"root": coverageConfiguration.getRoot()
				},
				"reporting": {
					"dir": coverageConfiguration.getPath()
				}
			};
			istanbulConfiguration = istanbul.config.loadObject(null, istanbulOverride);

			// Get configuration options
			reportingDir = path.resolve(istanbulConfiguration.reporting.dir());
			coverageFile = path.resolve(reportingDir, 'coverage.json');
			reports = coverageConfiguration.getReports() || [];

			// Create folder for reporting if not exists
			mkdirp.sync(reportingDir);

			if (reports.indexOf('file') !== -1) {

				// Write JSON file
				coverage = this._coverageCollector.getFinalCoverage();
				fs.writeFileSync(coverageFile, JSON.stringify(coverage, 4));

				// Filter "file"-report
				reports = reports.filter(function (entry) {
					return entry !== 'file';
				});
			}

			// Write report
			reporter = new istanbul.Reporter(istanbulConfiguration);
			reporter.addAll(reports);
			reporter.write(this._coverageCollector, true, function () {});
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'Preceptor'
	});

// Expose plugin interfaces

/**
 * @property AbstractClient
 * @type {AbstractClient}
 * @static
 */
PreceptorManager.AbstractClient = require('./abstractClient');

/**
 * @property AbstractClientDecorator
 * @type {AbstractClientDecorator}
 * @static
 */
PreceptorManager.AbstractClientDecorator = require('./abstractClientDecorator');

/**
 * @property AbstractForkTask
 * @type {AbstractForkTask}
 * @static
 */
PreceptorManager.AbstractForkTask = require('./abstractForkTask');

/**
 * @property AbstractTaskDecorator
 * @type {AbstractTaskDecorator}
 * @static
 */
PreceptorManager.AbstractTaskDecorator = require('./abstractTaskDecorator');

/**
 * @property AbstractTask
 * @type {AbstractTask}
 * @static
 */
PreceptorManager.AbstractTask = require('./abstractTask');

/**
 * @property version
 * @type {string}
 * @static
 */
PreceptorManager.version = require('../package.json').version;

module.exports = PreceptorManager;
