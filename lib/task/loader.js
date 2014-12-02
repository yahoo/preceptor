// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTask = require('../abstractTask');
var Promise = require('promise');
var utils = require('preceptor-core').utils;
var _ = require('underscore');
var ReportManager = require('preceptor-reporter');

/**
 * @class JUnitTask
 * @extends AbstractTask
 * @constructor
 */
var JUnitTask = AbstractTask.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.getOptions().configuration = utils.deepExtend({}, [
				{
					"format": 'junit',
					"path": null
				},
				this.getConfiguration()
			]);

			this.__super();
		},


		/**
		 * Validates the given data
		 *
		 * @method validate
		 */
		validate: function () {
			this.__super();

			if (!_.isString(this.getFormat())) {
				throw new Error('The "format" parameter is not a string.');
			}
			if (!_.isString(this.getPath())) {
				throw new Error('The "path" parameter is not a string.');
			}
		},


		/**
		 * Gets the file-format
		 *
		 * @method getFormat
		 * @return {string}
		 */
		getFormat: function () {
			return this.getConfiguration().format;
		},

		/**
		 * Gets the path to the files
		 *
		 * @method getPath
		 * @return {string}
		 */
		getPath: function () {
			return this.getConfiguration().path;
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

			var loaders = ReportManager.getLoaders(),
				format = this.getFormat().toLowerCase(),
				Class = loaders[format],
				loader,
				path = this.getPath(),
				configuration = this.getConfiguration();

			if (!Class) {
				throw new Error('Unknown loader format "' + format + '"');
			}

			loader = new Class({
				"type": format,
				"path": path,
				"configuration": configuration.configuration || {}
			});

			loader.on('message', function (areaType, messageType, params) {
				if (this.shouldReport()) {
					this.getReportManager().processMessage(messageType, params);
				}
			}.bind(this));

			loader.on('coverage', function (cov) {
				this.getCoverageCollector().add(cov)
			}.bind(this));

			return loader.process(parentId);
		}
	});

module.exports = JUnitTask;
