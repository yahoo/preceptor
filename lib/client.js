// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var istanbul = require('istanbul');
var path = require('path');
var minimatch = require('minimatch');
var fs = require('fs');

var log = require('./log');
var logger = log.getLogger(__filename);

/**
 * Runs the client
 *
 * @class Client
 * @method run
 * @param {object} options
 * @param {function} send
 * @private
 */
var run = function (options, send) {

	var clientPath = options.clientPath,
		coverage = options.coverage,
		parentId = options.parentId,
		configuration = options.configuration || {},
		globalConfig = options.globalConfig || {},
		decorators = options.decorators || [],
		decoratorPlugins = options.decoratorPlugins || {},
		logLevel = options.logLevel,
		label = options.label,

		ClientClass,
		clientInstance,

		coverageVar = '__preceptorCoverage__',
		instrumenter,
		transformer,
		globalCoverageConfig = globalConfig.coverage || {},
		coverageIncludes = globalCoverageConfig.includes || ['**/*.js'],
		coverageExcludes = globalCoverageConfig.excludes || ['**/node_modules/**', '**/test/**', '**/tests/**'];

	// Make sure that the client has the same log-level as Preceptor itself
	log.setLevel(logLevel);
	log.flush();

	// Make global configuration available
	logger.trace("Setup global Preceptor namespace");
	global.PRECEPTOR = {
		config: globalConfig
	};

	// Create client and run it
	logger.trace("Load client:", clientPath);
	if (!fs.existsSync(clientPath) && !fs.existsSync(clientPath + '.js')) {
		throw new Error("The client-plugin doesn't exist: " + clientPath);
	}
	ClientClass = require(clientPath);

	logger.trace("Instantiate client");
	clientInstance = new ClientClass(decorators, decoratorPlugins, configuration);
	clientInstance.on('reportMessage', function (messageType, data) {
		logger.trace("Received report message of type", messageType, "and data:", data);
		send({
			type: "reportMessage",
			messageType: messageType,
			data: data
		});
	});

	// Is coverage requested?
	if (((coverage === undefined) || (coverage === true)) && globalCoverageConfig.active) {

		logger.debug("Activate client coverage collection in variable:", coverageVar);

		// Prepare coverage instrumentation
		instrumenter = new istanbul.Instrumenter({ coverageVariable: coverageVar, preserveComments: true });
		transformer = instrumenter.instrumentSync.bind(instrumenter);

		// Hook-up transformer for every new file loaded
		istanbul.hook.hookRequire(function (filePath) {
			var allowed = false;

			logger.debug("Determine coverage instrumentation for file:", filePath);

			// Inclusion
			logger.trace("Inclusion options:", coverageIncludes);
			coverageIncludes.forEach(function (include) {
				allowed = allowed || minimatch(filePath, include);
			});
			logger.trace(allowed ? "Included" : "Not Included");

			if (allowed) {
				// Exclusion
				logger.trace("Exclusion options:", coverageIncludes);
				coverageExcludes.forEach(function (exclude) {
					allowed = allowed && !minimatch(filePath, exclude);
				});
				logger.trace(allowed ? "Not Excluded" : "Excluded");
			}

			logger.debug(allowed ? "Allowed" : "Not allowed");

			return allowed;

		}, transformer, {});

		// Prepare variable
		global[coverageVar] = {};
	}

	// Run client
	logger.trace("Run client with parent-id:", parentId);
	clientInstance.run(parentId).then(function () {

		logger.trace("Client completion with success");

		send({
			type: "completion",
			data: {
				success: true,
				coverage: global[coverageVar]
			}
		});

		global[coverageVar] = {}; // Reset

	}, function (err) {

		logger.trace("Client completion on error", err.stack);

		send({
			type: "completion",
			data: {
				success: false,
				coverage: global[coverageVar],
				context: err.stack
			}
		});

		global[coverageVar] = {}; // Reset
	});
};

process.on('message', function (options) {

	logger.debug("Receiving client-message:", options);

	if (options.type === "run") {
		run(options, function () {
			logger.debug("Sending client-message:", arguments);
			process.send.apply(process, arguments);
		});
	} else {
		throw new Error('Unknown message received: ' + options.type);
	}
});

process.on('uncaughtException', function (err) {

	// Debug as it is handled further up the chain
	logger.debug("Uncaught client exception:", err.stack);

	process.send({
		type: "exception",
		message: err.stack
	});
});
