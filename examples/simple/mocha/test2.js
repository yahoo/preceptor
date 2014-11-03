var assert = require('assert');
var lib = require('../lib');

it('should find all there is', function () {
	assert.equal(lib.allThereIs(), 42);
});

it('should calculate the worst first million years for marvin', function () {
	assert.equal(lib.worstFirstMillionYears(), 30);
});
