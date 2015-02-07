// Copyright 2015, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var log4js = require('log4js');
var path = require('path');
var _ = require('underscore');

var _level = null;
var _buffered = true;
var _buffer = [];

log4js.setGlobalLogLevel('INFO');

/**
 * Arguments logger with custom functionality
 *
 * @param {Logger} logger
 * @return {Logger}
 * @private
 */
var _argumentLogger = function (logger) {

	if (!logger.argumented) {

		['trace', 'debug', 'info', 'warn', 'error'].forEach(function (item) {
			var oldFunction = logger[item];

			logger[item] = function () {
				var args = Array.prototype.slice.call(arguments);

				for(var i = 0; i < args.length; i++) {
					if (_.isObject(args[i])) {
						args[i] = JSON.stringify(args[i], null, 4);
					}
				}

				if (logger.prefix) {
					args.unshift('(' + logger.prefix + ')');
				}

				if (_buffered) {
					_buffer.push({
						logger: logger,
						level: item,
						args: args
					});
				} else {
					oldFunction.apply(logger, args);
				}
			};
		});

		logger.argumented = true;
	}

	return logger;
};

/**
 * Logger object
 *
 * @class Logger
 *
 * @property log
 * @property trace
 * @property debug
 * @property info
 * @property warn
 * @property error
 */

/**
 * Logger management object
 *
 * @static log
 * @type {object}
 */
var log = {

	/**
	 * Get logging level
	 *
	 * @method getLevel
	 * @return {string}
	 */
	getLevel: function () {
		return _level;
	},

	/**
	 * Set logging level
	 *
	 * @method setLevel
	 * @param {string} level
	 */
	setLevel: function (level) {
		_level = level;
		log4js.setGlobalLogLevel(_level);
	},


	/**
	 * Return logger for a specific file
	 *
	 * @param {string} filename
	 * @return {Logger}
	 */
	getLogger: function (filename) {
		var logPath = filename;
		logPath = logPath.substr(__dirname.length + path.sep.length);
		return _argumentLogger(log4js.getLogger(logPath));
	},

	/**
	 * Flushes all buffered entries
	 *
	 * @method flush
	 */
	flush: function () {
		_buffered = false;

		// Trigger all the entries
		_buffer.forEach(function (entry) {
			entry.logger[entry.level].apply(entry.logger, entry.args);
		});
		_buffer = [];
	}
};

module.exports = log;
