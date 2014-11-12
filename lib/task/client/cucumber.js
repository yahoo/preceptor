// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractClient = require('../../abstractClient');
var Promise = require('promise');
var _ = require('underscore');
var utils = require('preceptor-core').utils;

/**
 * @class CucumberClient
 * @extends AbstractClient
 * @constructor
 */
var CucumberClient = AbstractClient.extend(

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

				this.BeforeFeatures(function (event, callback) {
					self.processBefore().then(function () {
						callback();
					}, function (err) {
						console.error(err.stack);
						callback(err);
					});
				});
				this.AfterFeatures(function (event, callback) {
					self.processAfter().then(function () {
						callback();
					}, function (err) {
						console.error(err.stack);
						callback(err);
					});
				});

				this.BeforeStep(function (event, callback) {
					self.processBeforeTest().then(function () {
						callback();
					}, function (err) {
						console.error(err.stack);
						callback(err);
					});
				});
				this.AfterStep(function (event, callback) {
					self.processAfterTest().then(function () {
						callback();
					}, function (err) {
						console.error(err.stack);
						callback(err);
					});
				});
			});
		},


		/**
		 * Gets the cucumber configuration
		 * Overwrite this function if the cucumber configuration is found somewhere else.
		 *
		 * @method getCucumberConfiguration
		 * @return {object}
		 */
		getCucumberConfiguration: function () {
			return this.getOptions();
		},

		/**
		 * Sets the cucumber configuration
		 * Overwrite this function if the cucumber configuration is found somewhere else.
		 *
		 * @method setCucumberConfiguration
		 * @param {object} options
		 */
		setCucumberConfiguration: function (options) {
			this._options = options;
		},


		/**
		 * Gets the path to the text files
		 * Cucumber Option: <Last parameter>
		 *
		 * @method getPath
		 * @return {string}
		 */
		getPath: function () {
			return this.getCucumberConfiguration().path;
		},

		/**
		 * Gets the tags to include/exclude
		 * Cucumber Option: tags
		 *
		 * @method getTags
		 * @return {string[]}
		 */
		getTags: function () {
			return this.getCucumberConfiguration().tags;
		},

		/**
		 * Gets the required file before running the tests
		 * Cucumber Option: require
		 *
		 * @method getRequires
		 * @return {string[]}
		 */
		getRequires: function () {
			return this.getCucumberConfiguration().require;
		},

		/**
		 * Gets the functions to execute as part of files to execute
		 * Cucumber Option: <does not exist>
		 *
		 * @method getFunctions
		 * @return {function[]}
		 */
		getFunctions: function () {
			return this.getCucumberConfiguration().functions;
		},

		/**
		 * Should output in coffee-script?
		 * Cucumber Option: coffee
		 *
		 * @method shouldOutputCoffeeScript
		 * @return {boolean}
		 */
		shouldOutputCoffeeScript: function () {
			return this.getCucumberConfiguration().coffeeScript;
		},

		/**
		 * Gets the output format for cucumber
		 * Cucumber Option: format
		 *
		 * @method getFormat
		 * @return {string}
		 */
		getFormat: function () {
			return this.getCucumberConfiguration().format;
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

				var hook,
					options,
					done;

				hook = this.getReportManager().loadHook('cucumber', parentId);

				options = this.getCucumberConfiguration();
				options.functions.push(hook);

				this.getReportManager().message().start();
				done = function () {
					this.getReportManager().message().stop();
					this.getReportManager().message().complete();
				}.bind(this);

				this._runCucumber(options, function () {
					done();
					resolve.apply(this, arguments);
				}, function () {
					done();
					reject.apply(this, arguments);
				});

			}.bind(this));
		},

		/**
		 * Runs the cucumber tests, self-contained
		 *
		 * @method _runCucumber
		 * @param {object} options
		 * @param {string} options.path
		 * @param {string[]} [options.tags]
		 * @param {string[]} [options.require]
		 * @param {function[]} [options.functions]
		 * @param {string} [options.format]
		 * @param {boolean} [options.coffeeScript]
		 * @param {function} success
		 * @param {function} failure
		 * @private
		 */
		_runCucumber: function (options, success, failure) {

			var args = [],
				cli,
				Cucumber = require('cucumber');

			if (options.tags) {
				_.each(options.tags, function (tagList) {
					if (!_.isArray(tagList)) {
						tagList = tagList.split(',');
					}
					args.push('--tags');
					args.push(tagList.join(','));
				});
			}

			if (options.format) {
				args.push('--format');
				args.push(options.format);
			}

			if (options.require) {
				_.each(options.require, function (require) {
					args.push('--require');
					args.push(require);
				});
			}

			if (options.coffeeScript) {
				args.push('--coffee');
			}

			args.push(options.path);

			// Adds the "functions" feature to cucumber
			(function () {
				var originalSupportCodeLoader = Cucumber.Cli.SupportCodeLoader,
					firstTimeLoaded = false;

				// Overwrite the constructor
				Cucumber.Cli.SupportCodeLoader = function () {

					var result = originalSupportCodeLoader.apply(this, arguments),
						originalBuildSupportCodeInitializerFromPaths = result.buildSupportCodeInitializerFromPaths;

					// Overwrite the resulting functions since they are created for each object in the constructor
					result.buildSupportCodeInitializerFromPaths = function () {

						var wrapperFn = originalBuildSupportCodeInitializerFromPaths.apply(this, arguments);

						// Overwrite the wrapper returned from the builder function
						return function () {

							// Execute functions as if they were in files
							if (!firstTimeLoaded) {
								firstTimeLoaded = true;

								_.each(options.functions, function (fn) {
									fn.call(this);
								}, this);
							}

							wrapperFn.apply(this, arguments);
						}
					};

					return result;
				};
			}());

			// Add some standard arguments that will be cut out in cucumber anyways
			args.unshift('node');
			args.unshift('cucumber.js');

			// Run cucumber with options supplied
			cli = Cucumber.Cli(args);
			cli.run(function (succeeded) {
				if (succeeded) {
					success(succeeded);
				} else {
					failure(new Error('Failed'));
				}
			});

			return cli;
		}
	});

module.exports = CucumberClient;
