// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;
var utils = require('preceptor-core').utils;
var ReportManager = require('preceptor-reporter');
var _ = require('underscore');
var Promise = require('promise');

var defaultClient = require('./defaults/defaultClient');

/**
 * @class AbstractClient
 * @extends Base
 *
 * @property {object} _options
 * @property {AbstractClientDecorator[]} decorators
 * @property {ReportManager} _reportManager
 * @property {EventReporter} _eventReporter
 */
var AbstractClient = Base.extend(

	/**
	 * Abstract client constructor
	 *
	 * @param {object[]} decorators
	 * @param {object} decoratorPlugins
	 * @param {object} options
	 * @constructor
	 */
	function (decorators, decoratorPlugins, options) {
		this.__super();

		this._reportManager = new ReportManager({ collect: false });
		this._eventReporter = this._reportManager.addReporter('Event');
		this._eventReporter.on('message', function (areaType, messageType, data) {
			// Make sure not to forward admin messages; this should stay in the client
			if (["admin"].indexOf(areaType) === -1) {
				this.emit('reportMessage', messageType, data);
			}
		}.bind(this));

		this._options = utils.deepExtend({}, [defaultClient, options || {}]);
		this.decorators = this._setupDecorators(this._eventReporter, decorators, decoratorPlugins);

		this.initialize();
	},

	{
		/**
		 * Setup decorator plugins
		 *
		 * @method _setupDecorators
		 * @param {EventReporter} eventReporter
		 * @param {object[]} decorators
		 * @param {object} decoratorPlugins
		 * @return {AbstractClientDecorator[]}
		 * @private
		 */
		_setupDecorators: function (eventReporter, decorators, decoratorPlugins) {

			var decoratorList = [];

			_.each(decorators, function (currentDecorator) {

				var decoratorPlugin = decoratorPlugins[currentDecorator.type.toLowerCase()],
					DecoratorClass,
					decoratorInstance;

				if (!decoratorPlugin) {
					throw new Error('Unknown decorator: ' + currentDecorator.type);
				}

				DecoratorClass = require(decoratorPlugin);
				decoratorInstance = new DecoratorClass(eventReporter, currentDecorator);
				decoratorList.push(decoratorInstance);

			}, this);

			return decoratorList;
		},


		/**
		 * Processes the begin of the testing environment
		 *
		 * @method processBefore
		 * @return {Promise}
		 */
		processBefore: function () {

			var promise = Promise.resolve();

			_.each(this.decorators, function (decorator) {
				promise = promise.then(function () {
					return decorator.processBefore();
				})
			}, this);

			return promise;
		},

		/**
		 * Processes the end of the testing environment
		 *
		 * @method processAfter
		 * @return {Promise}
		 */
		processAfter: function () {

			var promise = Promise.resolve();

			_.each(this.decorators, function (decorator) {
				promise = promise.then(function () {
					return decorator.processAfter();
				})
			}, this);

			return promise;
		},

		/**
		 * Processes the beginning of a test
		 *
		 * @method processBeforeTest
		 * @return {Promise}
		 */
		processBeforeTest: function () {

			var promise = Promise.resolve();

			_.each(this.decorators, function (decorator) {
				promise = promise.then(function () {
					return decorator.processBeforeTest();
				})
			}, this);

			return promise;
		},

		/**
		 * Processes the ending of a test
		 *
		 * @method processAfterTest
		 * @return {Promise}
		 */
		processAfterTest: function () {

			var promise = Promise.resolve();

			_.each(this.decorators, function (decorator) {
				promise = promise.then(function () {
					return decorator.processAfterTest();
				})
			}, this);

			return promise;
		},


		/**
		 * Gets the options
		 *
		 * @method getOptions
		 * @return {object}
		 */
		getOptions: function () {
			return this._options;
		},

		/**
		 * Gets the decorator
		 *
		 * @method getDecorator
		 * @return {AbstractClientDecorator[]}
		 */
		getDecorator: function () {
			return this.decorators;
		},


		/**
		 * Gets the report-manager
		 *
		 * @method getReportManager
		 * @return {ReportManager}
		 */
		getReportManager: function () {
			return this._reportManager;
		},

		/**
		 * Gets the event-reporter
		 *
		 * @method getEventReporter
		 * @return {EventReporter}
		 */
		getEventReporter: function () {
			return this._eventReporter;
		},


		/**
		 * Will be called when the client begins
		 *
		 * @method run
		 * @return {Promise}
		 */
		run: function () {
			throw new Error('Unimplemented method "run" in the client.');
		}
	},

	{
		/**
		 * @property TYPE
		 * @type {string}
		 * @static
		 */
		TYPE: 'AbstractClient'
	});

module.exports = AbstractClient;
