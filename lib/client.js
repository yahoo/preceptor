// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var _ = require('underscore');
var istanbul = require('istanbul');
var path = require('path');
var minimatch = require('minimatch');

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
		configuration = options.configuration,
		globalConfig = options.globalConfig,
		decorators = options.decorators,
		decoratorPlugins = options.decoratorPlugins,

		ClientClass,
		clientInstance,

		coverageVar = '__preceptorCoverage__',
		instrumenter,
		transformer,
		globalCoverageConfig = globalConfig.coverage,
		coverageIncludes = globalCoverageConfig.includes || ['**/*.js'],
		coverageExcludes = globalCoverageConfig.excludes || ['**/node_modules/**', '**/test/**', '**/tests/**'];

	// Make global configuration available
	global.PRECEPTOR = {
		config: globalConfig
	};

	// Create client and run it
	ClientClass = require(clientPath);
	clientInstance = new ClientClass(decorators, decoratorPlugins, configuration);
	clientInstance.on('reportMessage', function (messageType, data) {
		send({
			type: "reportMessage",
			messageType: messageType,
			data: data
		});
	});

	// Is coverage requested?
	if (((coverage === undefined) || (coverage === true)) && globalCoverageConfig.active) {

		// Prepare coverage instrumentation
		instrumenter = new istanbul.Instrumenter({ coverageVariable: coverageVar, preserveComments: true });
		transformer = instrumenter.instrumentSync.bind(instrumenter);

		// Hook-up transformer for every new file loaded
		istanbul.hook.hookRequire(function (filePath) {
			var allowed = false;

			// Inclusion
			_.each(coverageIncludes, function (include) {
				allowed = allowed || minimatch(filePath, include);
			});

			if (allowed) {
				// Exclusion
				_.each(coverageExcludes, function (exclude) {
					allowed = allowed && !minimatch(filePath, exclude);
				});
			}

			return allowed;

		}, transformer, {});

		// Prepare variable
		global[coverageVar] = {};
	}

	// Run client
	clientInstance.run(parentId).then(function () {
		send({
			type: "completion",
			data: {
				success: true,
				coverage: global[coverageVar]
			}
		});
		global[coverageVar] = {}; // Reset

	}, function (err) {
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
	if (options.type === "run") {
		run(options, function () {
			process.send.apply(process, arguments);
		});
	} else {
		throw new Error('Unknown message received: ' + options.type);
	}
});

process.on('uncaughtException', function (err) {
	process.send({
		type: "exception",
		message: err.stack
	});
});
