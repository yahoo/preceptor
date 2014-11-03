var assert = require('assert');
var lib = require('../lib');

it('should not panic', function () {
	assert.ok(lib.whatToDo("don't panic"));
});

it('should panic', function () {
	assert.ok(!lib.whatToDo("do not panic"));
});
