// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractTask = require('../abstractTask');
var childProcess = require('child_process');
var Promise = require('promise');
var utils = require('preceptor-core').utils;
var _ = require('underscore');

/**
 * @class ShellTask
 * @extends AbstractTask
 * @constructor
 */
var ShellTask = AbstractTask.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			this.getOptions().configuration = utils.deepExtend({}, [
				{
					cwd: null,
					env: {},
					cmd: null
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

			if (this.getCwd() && !_.isString(this.getCwd())) {
				throw new Error('The "suite" parameter is not a string.');
			}
			if (!_.isObject(this.getEnv())) {
				throw new Error('The "env" parameter is not an object.');
			}
			if (!_.isString(this.getCommand())) {
				throw new Error('The "cmd" parameter is not a string.');
			}
		},


		/**
		 * Get command to execute
		 *
		 * @method getCommand
		 * @return {string}
		 */
		getCommand: function () {
			return this.getConfiguration().cmd;
		},

		/**
		 * Get the environment variables set for the shell
		 *
		 * @method getEnv
		 * @return {object}
		 */
		getEnv: function () {
			return this.getConfiguration().env;
		},

		/**
		 * Get the current working directory
		 *
		 * @method getCwd
		 * @return {string|null}
		 */
		getCwd: function () {
			return this.getConfiguration().cwd;
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

			return new Promise(function (resolve, reject) {

				var env = this.getEnv() || {};
				env.PARENT_ID = parentId;

				childProcess.exec(this.getCommand(), {
					cwd: this.getCwd(),
					env: env

				}, function (error, stdout, stderr) {

					stdout = this.getReportManager().parse(stdout, { "#TASK#": parentId });
					stderr = this.getReportManager().parse(stderr, { "#TASK#": parentId });

					if (this.shouldEchoStdOut() && (stdout.length > 0)) {
						process.stdout.write((this.isVerbose() ? this.getLabel() + ": " : '') + stdout);
					}
					if (this.shouldEchoStdErr() && (stderr.length > 0)) {
						process.stderr.write((this.isVerbose() ? this.getLabel() + ": " : '') + stderr);
					}

					if (error) {
						reject(error);
					} else {
						resolve();
					}

				}.bind(this));
			}.bind(this));
		}
	});

module.exports = ShellTask;
