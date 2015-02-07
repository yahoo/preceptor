// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var childProcess = require('child_process');
var AbstractTask = require('./abstractTask');
var _ = require('underscore');
var Promise = require('promise');
var path = require('path');

var log = require('./log');
var logger = log.getLogger(__filename);

/**
 * @class AbstractForkTask
 * @extends AbstractTask
 * @constructor
 */
var AbstractForkTask = AbstractTask.extend(

	{
		/**
		 * Initializes the instance
		 *
		 * @method initialize
		 */
		initialize: function () {
			logger.prefix = this.getLabel();
			logger.trace("Initialize");
			this.__super();
		},

		/**
		 * Validates the given data
		 *
		 * @Method validate
		 */
		validate: function () {
			logger.trace("Validate options");

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

			logger.trace("Prepare client-fork");

			options = {
				type: "run",
				coverage: this.shouldCollectCoverage(),
				clientPath: clientPath,
				parentId: parentId,
				globalConfig: this.getGlobalConfig().toObject(),
				configuration: this.getConfiguration(),
				decorators: this.getDecorators(),
				decoratorPlugins: this.getClientDecoratorPlugins(),
				logLevel: log.getLevel(),
				label: this.getLabel()
			};
			options.configuration.label = this.getLabel();

			logger.debug("Fork options:", options);

			return new Promise(function (resolve, reject) {

				var ClientClass,
					clientInstance;

				logger.trace("Fork client");

				if (this.inDebug()) {
					logger.debug('Fork task-client in debug mode', clientPath);

					logger.trace("Load client:", clientPath);
					ClientClass = require(clientPath);

					logger.trace("Create client");
					clientInstance = new ClientClass(options.decorators, options.decoratorPlugins, options.configuration);

					logger.trace("Setup reporting with client");
					clientInstance.on('reportMessage', function (messageType, data) {
						if (this.shouldReport()) {
							logger.trace("Report message received from fork:", messageType, "with data:", data);
							this.getReportManager().processMessage(messageType, data);
						}
					}.bind(this));

					// Make global configuration available
					logger.trace("Setup global Preceptor namespace");
					global.PRECEPTOR = {
						config: options.globalConfig
					};

					logger.debug("Run forked client with parent-id:", parentId);
					clientInstance.run(parentId).then(function () {
						logger.debug("Completion on success");
						if (this.shouldCollectCoverage()) {
							logger.trace("Collect coverage report");
							this.getCoverageCollector().add(global.__preceptorCoverage__ || {});
							global.__preceptorCoverage__ = {};
						}
						resolve({ success: true });
					}.bind(this), function (err) {
						logger.debug("Completion on error", err.stack);
						if (this.shouldCollectCoverage()) {
							logger.trace("Collect coverage report");
							this.getCoverageCollector().add(global.__preceptorCoverage__ || {});
							global.__preceptorCoverage__ = {};
						}
						throw err;
					}.bind(this)).then(null, function (err) {
						if (shouldFailOnError) {
							logger.trace("Fork fails on error:", err.stack);
							reject(err);
						} else {
							logger.debug("Swallow error:", err.stack);
							resolve();
						}
					});
					// In debug-mode, the client cannot be parsed

				} else {
					logger.debug('Fork task-client:', clientPath);
					clientInstance = childProcess.fork(path.resolve(path.join(__dirname, 'client.js')), {
						silent: true
					});

					logger.trace("Setup fork messaging");
					clientInstance.on('message', function (dataPackage) {
						var err;

						logger.trace('Received message from fork:', dataPackage);

						switch(dataPackage.type) {

							case 'exception':
								throw new Error(dataPackage.message);
								break;

							case 'completion':

								if (this.shouldCollectCoverage() && dataPackage.data.coverage) {
									logger.trace("Collect coverage report");
									this.getCoverageCollector().add(dataPackage.data.coverage);
								}

								if (dataPackage.data.success) {
									logger.trace("On success");
									resolve(dataPackage.data);

								} else {
									err = new Error(JSON.stringify(dataPackage.data.context));
									if (shouldFailOnError) {
										logger.trace("Client fails on error:", err.message);
										reject(err);
									} else {
										logger.debug("Swallow error:", err.message);
										resolve();
									}
								}
								break;

							case 'reportMessage':
								if (this.shouldReport()) {
									logger.trace("Report message received from fork:", dataPackage.messageType, "with data:", dataPackage.data);
									this.getReportManager().processMessage(dataPackage.messageType, dataPackage.data);
								}
								break;
						}
					}.bind(this));

					clientInstance.stdout.on('data', function (data) {
						if (this.shouldReport()) {
							data = this.getReportManager().parse(data.toString('utf-8'), { "#TASK#": parentId });
							if (this.shouldEchoStdOut()) {
								process.stdout.write((this.isVerbose() ? this.getName() + ": " : '') + data);
							}
						}
					}.bind(this));

					clientInstance.stderr.on('data', function (data) {
						if (this.shouldReport()) {
							data = this.getReportManager().parse(data.toString('utf-8'), { "#TASK#": parentId });
							if (this.shouldEchoStdErr()) {
								process.stderr.write((this.isVerbose() ? this.getName() + ": " : '') + data);
							}
						}
					}.bind(this));

					logger.debug("Run forked client:", options);
					clientInstance.send(options);
				}

			}.bind(this));
		}
	});

module.exports = AbstractForkTask;
