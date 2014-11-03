// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var AbstractClientDecorator = require('../abstractClientDecorator');
var Promise = require('promise');

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
		 * @method start
		 */
		start: function () {
			console.log('PLAIN: start');
		},

		/**
		 * Called when reporting stops
		 *
		 * @method stop
		 */
		stop: function () {
			console.log('PLAIN: stop');
		},


		/**
		 * Reporting is completed
		 *
		 * @method complete
		 */
		complete: function () {
			console.log('PLAIN: complete');
		},


		/**
		 * Called when any item has custom data
		 *
		 * @method itemData
		 * @param {string} id
		 * @param {string} json JSON-data
		 */
		itemData: function (id, json) {
			console.log('PLAIN: itemData', id, json);
		},

		/**
		 * Called when any item has a custom message
		 *
		 * @method itemMessage
		 * @param {string} id
		 * @param {string} message
		 */
		itemMessage: function (id, message) {
			console.log('PLAIN: itemMessage', id, message);
		},


		/**
		 * Called when suite starts
		 *
		 * @method suiteStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} suiteName
		 */
		suiteStart: function (id, parentId, suiteName) {
			console.log('PLAIN: suiteStart', id, parentId, suiteName);
		},

		/**
		 * Called when suite ends
		 *
		 * @method suiteEnd
		 * @param {string} id
		 */
		suiteEnd: function (id) {
			console.log('PLAIN: suiteEnd', id);
		},


		/**
		 * Called when test starts
		 *
		 * @method testStart
		 * @param {string} id
		 * @param {string} parentId
		 * @param {string} testName
		 */
		testStart: function (id, parentId, testName) {
			console.log('PLAIN: testStart', id, parentId, testName);
		},


		/**
		 * Called when test fails
		 *
		 * @method testFailed
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testFailed: function (id, message, reason) {
			console.log('PLAIN: testFailed', id, message, reason);
		},

		/**
		 * Called when test has an error
		 *
		 * @method testError
		 * @param {string} id
		 * @param {string} [message]
		 * @param {string} [reason]
		 */
		testError: function (id, message, reason) {
			console.log('PLAIN: testError', id, message, reason);
		},

		/**
		 * Called when test has passed
		 *
		 * @method testPassed
		 * @param {string} id
		 */
		testPassed: function (id) {
			console.log('PLAIN: testPassed', id);
		},

		/**
		 * Called when test is undefined
		 *
		 * @method testUndefined
		 * @param {string} id
		 */
		testUndefined: function (id) {
			console.log('PLAIN: testUndefined', id);
		},

		/**
		 * Called when test is skipped
		 *
		 * @method testSkipped
		 * @param {string} id
		 * @param {string} [reason]
		 */
		testSkipped: function (id, reason) {
			console.log('PLAIN: testSkipped', id, reason);
		},

		/**
		 * Called when test is incomplete
		 *
		 * @method testIncomplete
		 * @param {string} id
		 */
		testIncomplete: function (id) {
			console.log('PLAIN: testIncomplete', id);
		},


		/**
		 * Processes the begin of the testing environment
		 *
		 * @method processBefore
		 * @return {Promise}
		 */
		processBefore: function () {
			console.log('PLAIN: processBefore');
			return Promise.resolve();
		},

		/**
		 * Processes the end of the testing environment
		 *
		 * @method processAfter
		 * @return {Promise}
		 */
		processAfter: function () {
			console.log('PLAIN: processAfter');
			return Promise.resolve();
		},

		/**
		 * Processes the beginning of a test
		 *
		 * @method processBeforeTest
		 * @return {Promise}
		 */
		processBeforeTest: function () {
			console.log('PLAIN: processBeforeTest');
			return Promise.resolve();
		},

		/**
		 * Processes the ending of a test
		 *
		 * @method processAfterTest
		 * @return {Promise}
		 */
		processAfterTest: function () {
			console.log('PLAIN: processAfterTest');
			return Promise.resolve();
		}
	});

module.exports = PlainClientDecorator;
