var assert =

describe('test suite', function () {
	it('should just work', function () {

	});

	describe('sub tests', function () {
		it('should also be successful', function () {
			require('../lib');
		});
	});

	it('should be incomplete');

	it.skip('should be skipped', function () {

	});

	var test = it('should be incomplete using the pending property', function () {

	});
	test.pending = true;

	it('should fail', function () {
		throw new Error('An error happened here.');
	});
});

describe('another test suite', function () {
	it('should also be successful in second suite', function () {

	});
});
