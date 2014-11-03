// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var MochaTask = require('./mocha');
var path = require('path');
var utils = require('preceptor-core').utils;
var _ = require('underscore');

/**
 * @class KoboldTask
 * @extends MochaTask
 * @constructor
 */
var KoboldTask = MochaTask.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.getOptions().configuration = utils.deepExtend({}, [
				{
					"verbose": false,

					"failForOrphans": true,
					"failOnAdditions": true,

					"build": process.env.BUILD_NUMBER || (process.env.USER + '_' + (+(new Date()))),

					"blinkDiff": {},

					"mocha": {
						"slow": 30000,
						"timeOut": 60000
					},

					"storage": {
						"type": 'File',

						"options": {
							"approvedFolderName": 'approved',
							"buildFolderName": 'build',
							"highlightFolderName": 'highlight'
						}
					}
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

			if (!_.isObject(this.getMochaConfiguration())) {
				throw new Error('The "mocha" parameter is not an object.');
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
			return this.getConfiguration().mocha;
		},

		/**
		 * Sets the mocha configuration
		 * Overwrite this function if the mocha configuration is found somewhere else.
		 *
		 * @method setMochaConfiguration
		 * @param {object} options
		 */
		setMochaConfiguration: function (options) {
			this.getConfiguration().mocha = options;
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
			return this.runClient(parentId, path.join(__dirname, 'client', 'kobold'));
		}
	});

module.exports = KoboldTask;
