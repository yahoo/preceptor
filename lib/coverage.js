// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var _ = require('underscore');

var defaultOptions = require('./defaults/defaultCoverage');

/**
 * @class Coverage
 * @extends Base
 *
 * @property {object} _options
 */
var Coverage = Base.extend(

	/**
	 * Coverage constructor
	 *
	 * @param {object} options
	 * @constructor
	 */
		function (options) {
		this.__super();

		this._options = utils.deepExtend({}, [ defaultOptions, options || {} ]);

		this.initialize();
	},

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			// Nothing yet
		},


		/**
		 * Gets the client-driver instance
		 *
		 * @method getInstance
		 * @return {*}
		 */
		getInstance: function () {
			return this._instance;
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
		 * Is coverage active?
		 *
		 * @method isActive
		 * @return {string}
		 */
		isActive: function () {
			return !!this.getOptions().active;
		},

		/**
		 * Get path to where the coverage data should be written to
		 *
		 * @method getPath
		 * @return {string}
		 */
		getPath: function () {
			return this.getOptions().path;
		},

		/**
		 * Gets the root-directory
		 *
		 * @method getRoot
		 * @return {string}
		 */
		getRoot: function () {
			return this.getOptions().root;
		},

		/**
		 * Gets the type of reports to create
		 *
		 * @method getReports
		 * @return {string}
		 */
		getReports: function () {
			return this.getOptions().reports;
		},

		/**
		 * Get includes for coverage
		 *
		 * @method getIncludes
		 * @return {string[]}
		 */
		getIncludes: function () {
			return this.getOptions().includes;
		},

		/**
		 * Get excludes for coverage
		 *
		 * @method getExcludes
		 * @return {string[]}
		 */
		getExcludes: function () {
			return this.getOptions().excludes;
		},


		/**
		 * Exports data to an object
		 *
		 * @method toObject
		 * @return {object}
		 */
		toObject: function () {
			return utils.deepExtend({}, [this.getOptions()]);
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'Coverage'
	});

module.exports = Coverage;
