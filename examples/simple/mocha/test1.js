var assert = require('assert');
var lib = require('../lib');

it('should know the answer to life, the universe, and everything', function () {
	assert.equal(lib.answerToLifeTheUniverseAndEverything(), 42);
});

describe('The End', function () {

	it('should print something', function () {
		lib.message();
	});
});
