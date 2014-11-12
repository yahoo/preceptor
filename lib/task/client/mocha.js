// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractClient = require('../../abstractClient');
var Promise = require('promise');
var _ = require('underscore');
var utils = require('preceptor-core').utils;
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var exists = fs.existsSync || path.existsSync;

Error.stackTraceLimit = Infinity;

/**
 * @class MochaClient
 * @extends AbstractClient
 * @constructor
 */
var MochaClient = AbstractClient.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {

			var self = this;

			this.__super();

			this.getFunctions().push(function () {
				before(function (done) {
					self.processBefore().then(function () {
						done();
					}, function (err) {
						console.error(err.stack);
						done(err);
					});
				});
				after(function (done) {
					self.processAfter().then(function () {
						done();
					}, function (err) {
						console.error(err.stack);
						done(err);
					});
				});
				beforeEach(function (done) {
					self.processBeforeTest().then(function () {
						done();
					}, function (err) {
						console.error(err.stack);
						done(err);
					});
				});
				afterEach(function (done) {
					self.processAfterTest().then(function () {
						done();
					}, function (err) {
						console.error(err.stack);
						done(err);
					});
				});
			});
		},


		/**
		 * Gets the mocha configuration
		 * Overwrite this function if the mocha configuration is found somewhere else.
		 *
		 * @method getMochaConfiguration
		 * @return {object}
		 */
		getMochaConfiguration: function () {
			return this.getOptions();
		},

		/**
		 * Sets the mocha configuration
		 * Overwrite this function if the mocha configuration is found somewhere else.
		 *
		 * @method setMochaConfiguration
		 * @param {object} options
		 */
		setMochaConfiguration: function (options) {
			this._options = options;
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
		 * @method useAsyncOnly
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
		 * @method getFunctions
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
		 * Execute client
		 *
		 * @method run
		 * @param {string} parentId
		 * @return {Promise}
		 */
		run: function (parentId) {

			return new Promise(function (resolve, reject) {

				var instance,
					hook,
					done;

				hook = this.getReportManager().loadHook('mocha', parentId);

				this.getReportManager().message().start();
				done = function () {
					this.getReportManager().message().stop();
					this.getReportManager().message().complete();
				}.bind(this);

				instance = this._runMocha(this.getMochaConfiguration(), function () {
					done();
					resolve.apply(this, arguments);
				}, function () {
					done();
					reject.apply(this, arguments);
				});
				hook(instance);

			}.bind(this));
		},

		/**
		 * Runs mocha tests, self-contained
		 *
		 * @method _runMocha
		 * @param {object} options
		 * @param {string} options.reporter
		 * @param {string} options.ui
		 * @param {boolean} options.colors
		 * @param {boolean} options.inlineDiffs
		 * @param {int} options.slow
		 * @param {boolean} options.timeOuts
		 * @param {int} options.timeOut
		 * @param {boolean} options.bail
		 * @param {boolean|string} options.grep
		 * @param {boolean} options.invert
		 * @param {boolean} options.checkLeaks
		 * @param {boolean} options.asyncOnly
		 * @param {string[]} options.globals
		 * @param {string[]} [options.paths=['test']]
		 * @param {functions[]} options.functions
		 * @param {boolean} options.recursive
		 * @param {string|string[]} options.require
		 * @param {boolean} options.sort
		 * @param {function} success
		 * @param {function} failure
		 * @return {*}
		 * @private
		 */
		_runMocha: function (options, success, failure) {

			var files = [],
				mocha,
				runner,
				paths,
				mochaLoadFiles,
				cwd = process.cwd(),
				Mocha = require('mocha');

			options = options || {};

			mocha = new Mocha();
			mochaLoadFiles = mocha.loadFiles;

			module.paths.push(cwd, path.join(cwd, 'node_modules'));

			// --reporter
			mocha.reporter(options.reporter);

			// --ui
			mocha.ui(options.ui);

			// --colors
			if (options.colors === false) {
				mocha.useColors(false);
			} else {
				mocha.useColors(true);
			}

			// --inline-diffs
			mocha.useInlineDiffs(options.inlineDiffs);

			// --slow <ms>
			mocha.suite.slow(options.slow);

			// --[no-]timeouts
			mocha.enableTimeouts(options.timeOuts);

			// --timeout
			mocha.suite.timeout(options.timeOut);

			// --bail
			mocha.suite.bail(options.bail);

			// --grep
			if (options.grep) {
				mocha.grep(new RegExp(options.grep));
			}

			// --invert
			if (options.invert) {
				mocha.invert();
			}

			// --check-leaks
			if (options.checkLeaks) {
				mocha.checkLeaks();
			}

			// --async-only
			if (options.asyncOnly) {
				mocha.asyncOnly();
			}

			// --globals
			mocha.globals(options.globals);

			// Find all test-files
			paths = options.paths;
			if ((paths.length === 0) && (options.functions.length > 0)) {
				paths = ['test'];
			}
			_.each(paths, function(path) {
				files = files.concat(lookupFiles(path, options.recursive));
			});

			if (options.require) {
				_.each(options.require, function (requireFile) {
					require(path.resolve(requireFile));
				});
			}

			// Resolve to full path
			files = files.map(function (filePath) {
				return path.resolve(filePath);
			});

			// --sort
			if (options.sort) {
				files.sort();
			}

			if ((files.length === 0) && (options.functions.length > 0)) {
				files.push(path.join(__dirname, 'resources', 'empty.js'));
			}

			// Load files
			mocha.files = files;

			// Add prepared functions instead of files
			if (options.functions) {
				mocha.loadFiles = function () {

					// Load the functions
					_.each(options.functions, function (currentFn, index) {
						var fileName = currentFn.name || 'function-' + index;
						mocha.suite.emit('pre-require', global, fileName, mocha);
						mocha.suite.emit('require', (_.isString(currentFn) ? require(currentFn) : currentFn()), fileName, mocha);
						mocha.suite.emit('post-require', global, fileName, mocha);
					});

					// Load all the files
					mochaLoadFiles.apply(this, arguments);

					// Add the functions as "files"
					_.each(options.functions, function (currentFn, index) {
						var fileName = currentFn.name || 'function-' + index;
						mocha.files.push(fileName);
					});
				};
			}

			// Run mocha tests
			runner = mocha.run(function (code) {
				if (code === 0) {
					success(code);
				} else {
					failure(new Error('Failed'));
				}
			});

			process.on('SIGINT', function() {
				runner.abort();
			});

			/**
			 * Lookup all files in the path given
			 *
			 * @method lookupFiles
			 * @param {string} currentPath
			 * @param {boolean} [recursive=false]
			 * @return {string[]}
			 * @private
			 */
			function lookupFiles (currentPath, recursive) {

				var files = [],
					stat;

				if (!exists(currentPath)) {

					if (exists(currentPath + '.js')) {
						currentPath += '.js'

					} else {
						files = glob.sync(currentPath);
						if (!files.length) {
							throw new Error("cannot resolve path (or pattern) '" + currentPath + "'");
						}
						return files;
					}
				}

				stat = fs.statSync(currentPath);
				if (stat.isFile()) {
					return [currentPath];

				} else {

					fs.readdirSync(currentPath).forEach(function (file) {
						var stat;

						file = path.join(currentPath, file);

						stat = fs.statSync(file);
						if (stat.isDirectory()) {

							if (recursive) {
								files = files.concat(lookupFiles(file, recursive));
							}

						} else if (stat.isFile() && (path.basename(file)[0] !== '.')) {
							files.push(file);
						}
					});

					return files;
				}
			}

			return runner;
		}
	});

module.exports = MochaClient;
