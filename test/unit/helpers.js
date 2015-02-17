var expect = require('chai').expect;

module.exports = {

	addBaseTests: function (instanceFn) {

		it('should have called parent', function () {
			expect(instanceFn.call(this)._uniqueId).to.be.not.undefined;
		});
	}
};
