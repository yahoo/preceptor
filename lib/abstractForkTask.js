// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var childProcess = require('child_process');
var AbstractTask = require('./abstractTask');
var _ = require('underscore');
var Promise = require('promise');
var path = require('path');

var logger = require('log4js').getLogger(__filename);

/**
 * @class AbstractForkTask
 * @extends AbstractTask
 * @constructor
 */
var AbstractForkTask = AbstractTask.extend(

	{
		/**
		 * Validates the given data
		 *
		 * @Method validate
		 */
		validate: function () {
			this.__super();
			if (!_.isBoolean(this.shouldFailOnError())) {
				throw new Error('The "failOnError" parameter is not a boolean.');
			}
		},


		/**
		 * Should task fail on error?
		 *
		 * @method shouldFailOnError
		 * @return {boolean}
		 */
		shouldFailOnError: function () {
			return this.getOptions().failOnError;
		},

		/**
		 * Runs the client in a forked environment
		 *
		 * @method runClient
		 * @param {string} parentId
		 * @param {string} clientPath
		 * @return {Promise}
		 */
		runClient: function (parentId, clientPath) {

			var options,
				shouldFailOnError = this.shouldFailOnError(),
				message;

			options = {
				type: "run",
				coverage: this.getOptions().coverage,
				clientPath: clientPath,
				parentId: parentId,
				globalConfig: this.getGlobalConfig().toObject(),
				configuration: this.getConfiguration(),
				decorator: this.getDecorator(),
				decoratorPlugins: this.getClientDecoratorPlugins()
			};

			return new Promise(function (resolve, reject) {

				var ClientClass,
					clientInstance;

				if (this.inDebug()) {
					logger.debug('Fork task-client in debug mode', clientPath);

					ClientClass = require(clientPath);
					clientInstance = new ClientClass(options.decorator, options.decoratorPlugins, options.configuration);

					clientInstance.on('reportMessage', function (messageType, data) {
						this.getReportManager().processMessage(messageType, data);
					}.bind(this));

					// Make global configuration available
					global.PRECEPTOR = {
						config: options.globalConfig
					};

					clientInstance.run(parentId).then(function () {
						this.getCoverageCollector().add(global.__preceptorCoverage__ || {});
						global.__preceptorCoverage__ = {};
						resolve({ success: true });
					}, function (err) {
						this.getCoverageCollector().add(global.__preceptorCoverage__ || {});
						global.__preceptorCoverage__ = {};
						if (shouldFailOnError) {
							reject(err);
						} else {
							logger.error(err.message);
							resolve();
						}
					});
					// In debug-mode, the client cannot be parsed

				} else {
					logger.debug('Fork task-client', clientPath, path.resolve(path.join(__dirname, 'client.js')));
					clientInstance = childProcess.fork(path.resolve(path.join(__dirname, 'client.js')), {
						silent: true
					});

					clientInstance.on('message', function (dataPackage) {
						var err;

						logger.debug('Received message from task-client', dataPackage);

						switch(dataPackage.type) {

							case 'exception':
								throw new Error(dataPackage.message);
								break;

							case 'completion':

								if (dataPackage.data.coverage) {
									this.getCoverageCollector().add(dataPackage.data.coverage);
								}

								if (dataPackage.data.success) {
									resolve(dataPackage.data);

								} else {
									err = new Error('Client failed with: ' + JSON.stringify(dataPackage.data.context));
									if (shouldFailOnError) {
										reject(err);
									} else {
										logger.error(err.message);
										resolve();
									}
								}
								break;

							case 'reportMessage':
								this.getReportManager().processMessage(dataPackage.messageType, dataPackage.data);
								break;
						}
					}.bind(this));

					clientInstance.stdout.on('data', function (data) {
						data = this.getReportManager().parse(data.toString('utf-8'), { "#TASK#": parentId });
						if (this.shouldEchoStdOut()) {
							process.stdout.write((this.isVerbose() ? this.getName() + ": " : '') + data);
						}
					}.bind(this));

					clientInstance.stderr.on('data', function (data) {
						data = this.getReportManager().parse(data.toString('utf-8'), { "#TASK#": parentId });
						if (this.shouldEchoStdErr()) {
							process.stderr.write((this.isVerbose() ? this.getName() + ": " : '') + data);
						}
					}.bind(this));

					clientInstance.send(options);
				}

			}.bind(this));
		}
	});

module.exports = AbstractForkTask;
