// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var MochaClient = require('./mocha');
var path = require('path');

/**
 * @class KoboldClient
 * @extends MochaClient
 * @constructor
 */
var KoboldClient = MochaClient.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			var options;

			this.__super();

			options = this.getOptions();
			this.getFunctions().push(function () {
				require('kobold')(options);
			});
			this.getPaths().push(path.join(__dirname, 'resources', 'empty.js'));
		},


		/**
		 * Gets the mocha configuration
		 * Overwrite this function if the mocha configuration is found somewhere else.
		 *
		 * @method getMochaConfiguration
		 * @return {object}
		 */
		getMochaConfiguration: function () {
			return this.getOptions().mocha;
		},

		/**
		 * Sets the mocha configuration
		 * Overwrite this function if the mocha configuration is found somewhere else.
		 *
		 * @method setMochaConfiguration
		 * @param {object} options
		 */
		setMochaConfiguration: function (options) {
			this.getOptions().mocha = options;
		}
	});

module.exports = KoboldClient;
