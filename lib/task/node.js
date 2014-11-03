// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractForkTask = require('../abstractForkTask');
var _ = require('underscore');
var path = require('path');

/**
 * @class NodeTask
 * @extends AbstractForkTask
 * @constructor
 */
var NodeTask = AbstractForkTask.extend(

	{
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
		},


		/**
		 * Gets the path of the file to require
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
			return this.runClient(parentId, path.join(__dirname, 'client', 'node'));
		}
	});

module.exports = NodeTask;
