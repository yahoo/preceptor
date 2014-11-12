module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec", "progress": false },
				{ "type": "List", "progress": false }
			]
		},
		"plugins": ["preceptor-webdriver"]
	},

	"tasks": [
		{
			"type": "mocha",
			"name": "First Mocha Task",
			"suite": true,
			"decorators":[{
				"type": "webDriver",
				"configuration": {
					"isolation": false,
					"client": {
						"type": "cabbie",
						"configuration": {
							"mode": "sync",
							"debug": true,
							"httpDebug": true
						},
						"capabilities": {
							"browserName": "firefox",
							"version": "latest"
						}
					},
					"server": {
						"type": "selenium"
					}
				}
			}],
			"configuration": {
				"coverage": true,
				"paths": [__dirname + "/index.js"],
				"timeOut": 60000
			}
		}
	]
};
