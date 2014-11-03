// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractClient = require('../../abstractClient');
var Promise = require('promise');
var _ = require('underscore');

/**
 * @class NodeClient
 * @extends AbstractClient
 * @constructor
 */
var NodeClient = AbstractClient.extend(

	{
		/**
		 * Gets the path of the file to require
		 *
		 * @method getPath
		 * @return {string}
		 */
		getPath: function () {
			return this.getOptions().path;
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

				var message = this.getReportManager().message();

				message.start();

				try {
					require(this.getPath())(parentId, this.getReportManager());

					message.stop();
					message.complete();

					resolve(true);

				} catch (err) {

					message.stop();
					message.complete();

					reject(err);
				}

			}.bind(this));
		}
	});

module.exports = NodeClient;
