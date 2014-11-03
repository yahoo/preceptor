// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractForkTask = require('../abstractForkTask');
var path = require('path');
var utils = require('preceptor-core').utils;
var _ = require('underscore');

/**
 * @class CucumberTask
 * @extends AbstractForkTask
 * @constructor
 */
var CucumberTask = AbstractForkTask.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.setCucumberConfiguration(utils.deepExtend({}, [
				{
					path: null,
					tags: [],
					require: [],
					functions: [],
					format: 'progress',
					coffeeScript: false
				},
				this.getCucumberConfiguration()
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

			if (!_.isString(this.getPath())) {
				throw new Error('The "path" parameter is not a string.');
			}
			if (!_.isArray(this.getTags())) {
				throw new Error('The "tags" parameter is not an array of strings.');
			}
			if (!_.isArray(this.getRequires())) {
				throw new Error('The "require" parameter is not an array of strings.');
			}
			if (!_.isArray(this.getFunctions())) {
				throw new Error('The "functions" parameter is not an array of functions.');
			}
			if (!_.isBoolean(this.shouldOutputCoffeeScript())) {
				throw new Error('The "coffeeScript" parameter is not a boolean.');
			}
			if (!_.isString(this.getFormat())) {
				throw new Error('The "format" parameter is not a string.');
			}
		},


		/**
		 * Gets the cucumber configuration
		 * Overwrite this function if the cucumber configuration is found somewhere else.
		 *
		 * @method getCucumberConfiguration
		 * @return {object}
		 */
		getCucumberConfiguration: function () {
			return this.getConfiguration();
		},

		/**
		 * Sets the cucumber configuration
		 * Overwrite this function if the cucumber configuration is found somewhere else.
		 *
		 * @method setCucumberConfiguration
		 * @param {object} options
		 */
		setCucumberConfiguration: function (options) {
			this.getOptions().configuration = options;
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
		 * @method getFunctions
		 * @return {string}
		 */
		getFormat: function () {
			return this.getCucumberConfiguration().format;
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
			return this.runClient(parentId, path.join(__dirname, 'client', 'cucumber'));
		}
	});

module.exports = CucumberTask;
