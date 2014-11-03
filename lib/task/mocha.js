// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractForkTask = require('../abstractForkTask');
var path = require('path');
var utils = require('preceptor-core').utils;
var _ = require('underscore');

/**
 * @class MochaTask
 * @extends AbstractForkTask
 * @constructor
 */
var MochaTask = AbstractForkTask.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.setMochaConfiguration(utils.deepExtend({}, [
				{
					reporter: 'spec',
					ui: 'bdd',
					colors: true,
					inlineDiffs: false,
					slow: 75,
					timeOuts: true,
					timeOut: 2000,
					bail: false,
					grep: false,
					invert: false,
					checkLeaks: false,
					asyncOnly: false,
					globals: [],
					paths: [],
					functions: [],
					recursive: false,
					require: [],
					sort: false
				},
				this.getMochaConfiguration()
			]));

			this.__super();
		},


		/**
		 * Validates the given data
		 *
		 * @method validate
		 */
		validate: function () {
			this.__super();

			if (!_.isString(this.getReporter())) {
				throw new Error('The "reporter" parameter is not a string.');
			}
			if (!_.isString(this.getUi())) {
				throw new Error('The "ui" parameter is not a string.');
			}
			if (!_.isBoolean(this.useColors())) {
				throw new Error('The "colors" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.useInlineDiffs())) {
				throw new Error('The "inlineDiffs" parameter is not a boolean.');
			}
			if (!_.isNumber(this.getSlowThreshold())) {
				throw new Error('The "slow" parameter is not a number.');
			}
			if (!_.isBoolean(this.useTimeOuts())) {
				throw new Error('The "timeOuts" parameter is not a boolean.');
			}
			if (!_.isNumber(this.getTimeOut())) {
				throw new Error('The "timeOut" parameter is not a number.');
			}
			if (!_.isBoolean(this.shouldBail())) {
				throw new Error('The "bail" parameter is not a boolean.');
			}
			if (!_.isString(this.getGrep()) && !_.isBoolean(this.getGrep())) {
				throw new Error('The "grep" parameter is not a string or boolean.');
			}
			if (!_.isBoolean(this.shouldInvert())) {
				throw new Error('The "invert" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.shouldCheckLeaks())) {
				throw new Error('The "checkLeaks" parameter is not a boolean.');
			}
			if (!_.isBoolean(this.useAsyncOnly())) {
				throw new Error('The "asyncOnly" parameter is not a boolean.');
			}
			if (!_.isArray(this.getGlobals())) {
				throw new Error('The "globals" parameter is not an array of strings.');
			}
			if (!_.isArray(this.getPaths())) {
				throw new Error('The "paths" parameter is not an array of strings.');
			}
			if (!_.isArray(this.getFunctions())) {
				throw new Error('The "functions" parameter is not an array of strings.');
			}
			if (!_.isBoolean(this.getRecursive())) {
				throw new Error('The "recursive" parameter is not a boolean.');
			}
			if (!_.isArray(this.getRequire())) {
				throw new Error('The "require" parameter is not an array of strings.');
			}
			if (!_.isBoolean(this.shouldSort())) {
				throw new Error('The "sort" parameter is not a boolean.');
			}
		},


		/**
		 * Gets the mocha configuration
		 * Overwrite this function if the mocha configuration is found somewhere else.
		 *
		 * @method getMochaConfiguration
		 * @return {object}
		 */
		getMochaConfiguration: function () {
			return this.getConfiguration();
		},

		/**
		 * Sets the mocha configuration
		 * Overwrite this function if the mocha configuration is found somewhere else.
		 *
		 * @method setMochaConfiguration
		 * @param {object} options
		 */
		setMochaConfiguration: function (options) {
			this.getOptions().configuration = options;
		},


		/**
		 * Gets the reporter
		 * Mocha Option: reporter
		 *
		 * @method getReporter
		 * @return {string}
		 */
		getReporter: function () {
			return this.getMochaConfiguration().reporter;
		},

		/**
		 * Gets the UI interface ('tdd', 'bdd')
		 * Mocha Option: ui
		 *
		 * @method getUi
		 * @return {string}
		 */
		getUi: function () {
			return this.getMochaConfiguration().ui;
		},

		/**
		 * Should colors be used in output?
		 * Mocha Option: colors
		 *
		 * @method useColors
		 * @return {boolean}
		 */
		useColors: function () {
			return this.getMochaConfiguration().colors;
		},

		/**
		 * Output inline diffs
		 * Mocha Option: inline-diffs
		 *
		 * @method useInlineDiffs
		 * @return {boolean}
		 */
		useInlineDiffs: function () {
			return this.getMochaConfiguration().inlineDiffs;
		},

		/**
		 * Gets the threshold for slow tests
		 * Mocha Option: slow
		 *
		 * @method getSlowThreshold
		 * @return {int}
		 */
		getSlowThreshold: function () {
			return this.getMochaConfiguration().slow;
		},

		/**
		 * Should time-outs be observed?
		 * Mocha Option: [no-]timeouts
		 *
		 * @method useTimeOuts
		 * @return {boolean}
		 */
		useTimeOuts: function () {
			return this.getMochaConfiguration().timeOuts;
		},

		/**
		 * Gets the threshold for too slow test-suites
		 * Mocha Option: timeout
		 *
		 * @method getTimeOut
		 * @return {int}
		 */
		getTimeOut: function () {
			return this.getMochaConfiguration().timeOut;
		},

		/**
		 * Should mocha bail on first error?
		 * Mocha Option: bail
		 *
		 * @method shouldBail
		 * @return {boolean}
		 */
		shouldBail: function () {
			return this.getMochaConfiguration().bail;
		},

		/**
		 * Gets the test filter
		 * Mocha Option: grep
		 *
		 * @method getGrep
		 * @return {string|boolean}
		 */
		getGrep: function () {
			return this.getMochaConfiguration().grep;
		},

		/**
		 * Should the test sequence inverted?
		 * Mocha Option: invert
		 *
		 * @method shouldInvert
		 * @return {boolean}
		 */
		shouldInvert: function () {
			return this.getMochaConfiguration().invert;
		},

		/**
		 * Should mocha check for leaks
		 * Mocha Option: check-leaks
		 *
		 * @method shouldCheckLeaks
		 * @return {boolean}
		 */
		shouldCheckLeaks: function () {
			return this.getMochaConfiguration().checkLeaks;
		},

		/**
		 * Gets the reporter
		 * Mocha Option: async-only
		 *
		 * @Method useAsyncOnly
		 * @return {boolean}
		 */
		useAsyncOnly: function () {
			return this.getMochaConfiguration().asyncOnly;
		},

		/**
		 * Gets the list of defined globals
		 * Mocha Option: globals
		 *
		 * @method getGlobals
		 * @return {string[]}
		 */
		getGlobals: function () {
			return this.getMochaConfiguration().globals;
		},

		/**
		 * Gets the path of all tests
		 * Mocha Option: <last parameters>
		 *
		 * @method getPaths
		 * @return {string[]}
		 */
		getPaths: function () {
			return this.getMochaConfiguration().paths;
		},

		/**
		 * Gets a list of functions to execute before the tests
		 * Mocha Option: <does not exist>
		 *
		 * @Method getFunctions
		 * @return {function[]}
		 */
		getFunctions: function () {
			return this.getMochaConfiguration().functions;
		},

		/**
		 * Should the test-search be recursive?
		 * Mocha Option: recursive
		 *
		 * @method getRecursive
		 * @return {boolean}
		 */
		getRecursive: function () {
			return this.getMochaConfiguration().recursive;
		},

		/**
		 * List of files to be required before the tests are run
		 * Mocha Option: require
		 *
		 * @method getRequire
		 * @return {string[]}
		 */
		getRequire: function () {
			return this.getMochaConfiguration().require;
		},

		/**
		 * Should tests be sorted after gathering and before executing?
		 * Mocha Option: sort
		 *
		 * @method shouldSort
		 * @return {boolean}
		 */
		shouldSort: function () {
			return this.getMochaConfiguration().sort;
		},


		/**
		 * Run the client
		 *
		 * @method _run
		 * @param {string} parentId
		 * @return {Promise}
		 * @private
		 */
		_run: function (parentId) {
			return this.runClient(parentId, path.join(__dirname, 'client', 'mocha'));
		}
	});

module.exports = MochaTask;
