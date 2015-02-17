// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractClientDecorator = require('../abstractClientDecorator');
var Promise = require('promise');

var logger = require('../log').getLogger(__filename);

/**
 * @class PlainClientDecorator
 * @extends AbstractClientDecorator
 * @constructor
 */
var PlainClientDecorator = AbstractClientDecorator.extend(

	{
		/**
		 * Called when reporting starts
		 *
		 * Note: This is an event.
		 *
		 * @method start
		 */
		start: function () {
			logger.info('PLAIN: start');
		},

		/**
		 * Called when reporting stops
		 *
		 * Note: This is an event.
		 *
		 * @method stop
		 */
		stop: function () {
			logger.info('PLAIN: stop');
		},


		/**
		 * Reporting is completed
		 *
		 * Note: This is an event.
		 *
		 * @method complete
		 */
		complete: function () {
			logger.info('PLAIN: complete');
		},


		/**
		 * Called when any item has custom data
		 *
		 * Note: This is an event.
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			logger.info('PLAIN: itemData', id, json);
		},

		/**
		 * Called when any item has a custom message
		 *
		 * Note: This is an event.
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			logger.info('PLAIN: itemMessage', id, message);
		},


		/**
		 * Called when suite starts
		 *
		 * Note: This is an event.
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 */
		suiteStart: function (id, parentId, suiteName) {
			logger.info('PLAIN: suiteStart', id, parentId, suiteName);
		},

		/**
		 * Called when suite ends
		 *
		 * Note: This is an event.
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			logger.info('PLAIN: suiteEnd', id);
		},


		/**
		 * Called when test starts
		 *
		 * Note: This is an event.
		 *
		 * @method testStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} testName
		 */
		testStart: function (id, parentId, testName) {
			logger.info('PLAIN: testStart', id, parentId, testName);
		},


		/**
		 * Called when test fails
		 *
		 * Note: This is an event.
		 *
		 * @method testFailed
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testFailed: function (id, message, reason) {
			logger.info('PLAIN: testFailed', id, message, reason);
		},

		/**
		 * Called when test has an error
		 *
		 * Note: This is an event.
		 *
		 * @method testError
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testError: function (id, message, reason) {
			logger.info('PLAIN: testError', id, message, reason);
		},

		/**
		 * Called when test has passed
		 *
		 * Note: This is an event.
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			logger.info('PLAIN: testPassed', id);
		},

		/**
		 * Called when test is undefined
		 *
		 * Note: This is an event.
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			logger.info('PLAIN: testUndefined', id);
		},

		/**
		 * Called when test is skipped
		 *
		 * Note: This is an event.
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			logger.info('PLAIN: testSkipped', id, reason);
		},

		/**
		 * Called when test is incomplete
		 *
		 * Note: This is an event.
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			logger.info('PLAIN: testIncomplete', id);
		},


		/**
		 * Processes the begin of the testing environment
		 *
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
		 *
		 * @method processBefore
		 * @return {Promise}
		 */
		processBefore: function () {
			logger.info('PLAIN: processBefore');
			return Promise.resolve();
		},

		/**
		 * Processes the end of the testing environment
		 *
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
		 *
		 * @method processAfter
		 * @return {Promise}
		 */
		processAfter: function () {
			logger.info('PLAIN: processAfter');
			return Promise.resolve();
		},

		/**
		 * Processes the beginning of a test
		 *
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
		 *
		 * @method processBeforeTest
		 * @return {Promise}
		 */
		processBeforeTest: function () {
			logger.info('PLAIN: processBeforeTest');
			return Promise.resolve();
		},

		/**
		 * Processes the ending of a test
		 *
		 * Note: This is a waiting function call, meaning that the caller waits for the return.
		 *
		 * @method processAfterTest
		 * @return {Promise}
		 */
		processAfterTest: function () {
			logger.info('PLAIN: processAfterTest');
			return Promise.resolve();
		}
	});

module.exports = PlainClientDecorator;
