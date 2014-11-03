console.log('Mostly Harmless');

module.exports = {

	answerToLifeTheUniverseAndEverything: function () {
		return 42;
	},

	whatToDo: function (phrase) {
		return (phrase == "don't panic");
	},

	allThereIs: function () {
		return 6 * 9;
	},

	worstFirstMillionYears: function () {
		return 10 + 10 + 10;
	},

	message: function () {
		console.log("So Long, and Thanks for All the Fish.");
	},

	startInfiniteImprobabilityDriver: function () {
		throw new Error("infinitely improbable");
	}
};
