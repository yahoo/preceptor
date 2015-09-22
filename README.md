![Preceptor Logo](https://raw.githubusercontent.com/yahoo/preceptor/master/images/logo1.png)

Preceptor is a test-runner and test-aggregator that runs multiple tests and testing frameworks in parallel, sequential, or a combination there of, aggregating all of the test-results and coverage-reports.


[![Build Status](https://secure.travis-ci.org/yahoo/preceptor.png)](http://travis-ci.org/yahoo/preceptor)
[![npm version](https://badge.fury.io/js/preceptor.svg)](http://badge.fury.io/js/preceptor)

[![NPM](https://nodei.co/npm/preceptor.png?downloads=true)](https://nodei.co/npm/preceptor/)


[API-Documentation](http://yahoo.github.io/preceptor/docs/)

[Coverage Report](http://yahoo.github.io/preceptor/coverage/lcov-report/)

##Quick Look
Main-Features:
* Runs tests sequentially, in parallel, or a combination thereof.
* Support of multiple commonly used testing frameworks including: Mocha, Cucumber, and Kobold.
* Test-report aggregation, combining all of the test-results in one place, supporting a big list of commonly used reporters, including display reporters such as “Spec” and “Dot” and file-format reporters such as “JUnit” and “TAP”, all of which can be used at the same time.
* Centralized collection of code-coverage metrics for every test that ran, merging all of the results in one place, giving the developers and testers a complete picture of what has been tested, and what might needs more tests.

Features through plugins:
* Selenium test management, starting-up and tearing-down Selenium servers transparently for the developers and testers, injecting code to the test-client, reducing with it the boilerplate code needed to run Selenium tests. This will also help simplify the configuration of the Selenium test system.
* Client-side code-coverage collection, merging the code-coverage reports of an application that ran in a browser.



**Table of Contents**
* [Installation](#installation)
* [What is Preceptor?](#what-is-preceptor)
* [Getting Started](#getting-started)
* [Usage](#usage)
    * [Client-API](#client-api)
    * [Command-Line Usage](#command-line-usage)
    * [Testing Lifecycle](#testing-lifecycle)
        * [Administrative states](#administrative-states)
        * [Suite management](#suite-management)
        * [Test management](#test-management)
    * [Configuration](#configuration)
        * [Global configuration](#global-configuration)
            * [Reporting](#reporting)
            * [Coverage](#coverage)
            * [Plugins](#plugins)
        * [Shared configuration](#shared-configuration)
    * [Tasks](#tasks)
        * [General configuration](#general-configuration)
        * [Cucumber Task](#cucumber-task)
        * [Mocha Task](#mocha-task)
        * [Kobold Task](#kobold-task)
        * [Loader Task](#loader-task)
        * [Node Task](#node-task)
        * [Shell Task](#shell-task)
        * [Group Task](#group-task)
    * [Task Decorators](#task-decorators)
    * [Client Decorators](#client-decorators)
    * [Client Runner](#client-runner)
    * [Plugin Naming](#plugin-naming)
* [API-Documentation](#api-documentation)
* [Tests](#tests)
* [Third-party libraries](#third-party-libraries)
* [License](#license)


##Installation

Install this module with the following command:
```shell
npm install preceptor
```

To add the module to your ```package.json``` dependencies:
```shell
npm install --save preceptor
```
To add the module to your ```package.json``` dev-dependencies:
```shell
npm install --save-dev preceptor
```

##What is Preceptor?

Today, there are a lot of testing frameworks out there, many of which are optimized for testing specific areas. A couple of these frameworks are:
* *Mocha* - The most popular unit-testing tool (according to NPM downloads), testing each individual unit/component of a system in isolation.
* *Cucumber* - A high-level acceptance testing tool that tests features through scenarios, giving product owners and teams a higher degree of collaboration, and management a deeper understanding of the systems and to what extend it is tested.
* *Kobold* - A visual regression testing tool, making sure that any visual changes are recognized before the code goes out.
* ...

All of these testing-frameworks produce their own test results - often in different output formats. Additional testing tools, like Selenium, create even more results, generating the results for tests that were run in multiple browsers. CI systems help here a bit since they can usually handle multiple results, but all the results are usually plugged into one root-node, making it hard to organize and analyse the test-results. Some engineers spend a good amount of time aggregating all of these results in a reasonable manner, creating often one-off hacks to merge all the results. Others just manually parse through the results, determining if any kind of problems were encountered during the most recent test-run, loosing the ability to have a one-look green/red summary.

Code-coverage metrics pose a similar problem: code-coverage reports are created independently and in isolation of tests that run for the same system in different testing frameworks or in separate tests (unit, component, integration, functional, acceptance, ...). It is challenging to have a complete overview of all coverage metrics as there is never only one coverage-report for all the tests. What is usually the case is that only some tests have coverage reports, possibly having only a subset of the metrics that could have been collected - most testing systems, for example, are not collecting client-side coverage-reports when running integration tests with Selenium; these are valuable coverage results.

In addition, all of these tools need to be coordinated, running sequentially, in parallel, or even a combination thereof. However, many testing tools do not have this capability build-in, resulting in third-party developers create their own solutions which are quite often not much more than a hack, having also quite possibly inconsistent interfaces as they are usually not created by the same people. All of this coordination can easily turn the code-base into an unmaintainable mess, quite possibly triggering false-positives due to flaky testing infrastructure and code.

Preceptor tries to solve all of these problems by using a consistent way of configuring the tools, managing the workflow within a single configuration file, and aggregating the test-results and code-coverage reports in one place. In addition, it adds a flexible and extensible plugin infrastructure to the test-runner, introducing even more features like a Selenium / WebDriver integration, injecting client/server code in setup/teardown methods of different testing frameworks, keeping the test-code free of glue-code.

Preceptor comes with the following features out of the box:
* Test-report aggregation, combining all of the test-results in one place, supporting a big list of commonly used reporters, including display reporters such as “Spec” and “Dot” and file-format reporters such as “JUnit” and “TAP”, all of which can be used at the same time.
* Centralized collection of code-coverage metrics for every test that ran, merging all of the results in one place, giving the developers, testers, and managers a complete picture of what has been tested, and what might need more tests.
* Coordination of tests, queuing them, running them in parallel, or composing them - any way the developer needs or wants them to run.
* Support of multiple commonly used testing frameworks including: Mocha, Cucumber, and Kobold. Support for other frameworks and test-runners like Jasmine and Karma are a WIP.
* Report listeners to parse results from unsupported testing-framework through the usage of commonly used protocols like the TeamCity test-result protocol that is used by the IntelliJ IDEs.

As mentioned, plugins add even more features, including:
* Selenium test management, starting-up and tearing-down Selenium servers transparently for the developers and testers, injecting code to the test-client, reducing with it the boilerplate code needed to run Selenium tests. This will also help simplify the configuration of the Selenium test system.
* Client-side code-coverage collection, merging the code-coverage reports of an application that ran in a browser.

##Getting Started

Preceptor comes with a command-line tool that takes a configuration file that defines what sequence the task should run, what data needs to be collected, and how some tasks affect others.

Let's have a look at some examples that uses Mocha as sole testing tool. Preceptor can be used to mix multiple testing frameworks and independent tests at the same time, however, I will only use Mocha for the next examples.

To get started, create the following file with the name ```config.js```:
```javascript
module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec" },
				{ "type": "List", "progress": false }
			]
		}
	},

	"tasks": [
		{ // Task
			"type": "mocha",
			"title": "Everything", // Just giving the task a title
			"configuration": {
				"paths": [__dirname + "/mocha/test1.js"]
			}
		}
	]
};
```
This configuration adds a Mocha task and two reports:
* ```Spec``` - A detailed console report that is very similar to Mocha's ```spec``` reporter.
* ```List``` - Comprehensive list of all problems encountered which will be printed add the end of all test-runs.

As SUT, add the following ```lib.js``` file to the same folder:
```javascript
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
```

The tests live in a sub-folder with the name ```mocha```. For now, let's add a couple of simple tests that give you a glimpse on how test-results will look.

Copy the following content into ```mocha/test1.js```:
```javascript
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
```

Preceptor adds a command-line tool that can be executed by calling ```preceptor``` in the shell (when installed globally). Run Preceptor with the above created configuration file:
```shell
preceptor config.js
```
The result should look something like this (colors are not shown):
```shell
  ✓ should know the answer to life, the universe, and everything

  The End
    ✓ should print something
```
You can see that the output that was created in ```lib.js``` isn't visible anywhere. By default, Preceptor will hide any output created by tests, the SUT, and the testing-framework, displaying only the output of loaded reporters. This behavior can be changed by modifying values in the task-options for each individual tasks. For more information on how to do this, please refer to the API documentation or see below.

Now, to show some of the features, let's add two more test files:

**mocha/test2.js**
```javascript
var assert = require('assert');
var lib = require('../lib');

it('should find all there is', function () {
	assert.equal(lib.allThereIs(), 42);
});

it('should calculate the worst first million years for marvin', function () {
	assert.equal(lib.worstFirstMillionYears(), 30);
});
```

**mocha/test3.js**
```javascript
var assert = require('assert');
var lib = require('../lib');

it('should not panic', function () {
	assert.ok(lib.whatToDo("don't panic"));
});

it('should panic', function () {
	assert.ok(!lib.whatToDo("do not panic"));
});
```

Let's run them all sequentially. Simply add them to the task-list:
```javascript
module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec" },
				{ "type": "List", "progress": false }
			]
		}
	},

	"tasks": [
		{
			"type": "mocha",
			"title": "Everything",
			"configuration": {
				"paths": [__dirname + "/mocha/test1.js"]
			}
		},
		{
			"type": "mocha",
			"title": "Calculations",
			"configuration": {
				"paths": [__dirname + "/mocha/test2.js"]
			}
		},
		{
			"type": "mocha",
			"title": "Phrasing",
			"configuration": {
				"paths": [__dirname + "/mocha/test3.js"]
			}
		}
	]
};
```
Run Preceptor:
```shell
  ✓ should know the answer to life, the universe, and everything

  The End
    ✓ should print something
  1) should find all there is
  ✓ should calculate the worst first million years for marvin
  ✓ should not panic
  ✓ should panic

  1) Root should find all there is
     54 == 42
AssertionError: 54 == 42
    at Context.<anonymous> (.../mocha/test2.js:5:9)
    ... // Abbreviated
```

This example shows a failed test, displaying some details and the stack-trace that is abbreviated here in the output for our examples. Let's keep this failing test around for now.

Great! However, now, the tests appear to run all in the same top-level test-suite - we cannot easily distinguish which tests were run in which task. Let's change this. Add a ```suite:true``` to each task, turning each task into a virtual test-suite that creates a new level of test-suites in the test-results using the ```title``` given.
```javascript
module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec" },
				{ "type": "List", "progress": false }
			]
		}
	},

	"tasks": [
		{
			"type": "mocha",
			"title": "Everything",
			"suite": true,
			"configuration": {
				"paths": [__dirname + "/mocha/test1.js"]
			}
		},
		{
			"type": "mocha",
			"title": "Calculations",
			"suite": true,
			"configuration": {
				"paths": [__dirname + "/mocha/test2.js"]
			}
		},
		{
			"type": "mocha",
			"title": "Phrasing",
			"suite": true,
			"configuration": {
				"paths": [__dirname + "/mocha/test3.js"]
			}
		}
	]
};
```
The output for this configuration is:
```shell
  Everything
    ✓ should know the answer to life, the universe, and everything

    The End
      ✓ should print something

  Calculations
    1) should find all there is
    ✓ should calculate the worst first million years for marvin

  Phrasing
    ✓ should not panic
    ✓ should panic

  1) Calculations should find all there is
     54 == 42
AssertionError: 54 == 42
    at Context.<anonymous> (.../mocha/test2.js:5:9)
    ... // Abbreviated
```
Great! That looks already a lot better.

But now, I want to run the first tests in parallel, and the last test should run when the first two tests are both completed. Simply wrap the first two tasks in an array literal. This will group the tasks together.
```javascript
module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec" },
				{ "type": "List", "progress": false }
			]
		}
	},

	"tasks": [
		[{ // <-----
			"type": "mocha",
			"title": "Everything",
			"suite": true,
			"configuration": {
				"paths": [__dirname + "/mocha/test1.js"]
			}
		},
		{
			"type": "mocha",
			"title": "Calculations",
			"suite": true,
			"configuration": {
				"paths": [__dirname + "/mocha/test2.js"]
			}
		}], // <-----
		{
			"type": "mocha",
			"title": "Phrasing",
			"suite": true,
			"configuration": {
				"paths": [__dirname + "/mocha/test3.js"]
			}
		}
	]
};

```
Let's run it again:
```shell
  Everything

  Calculations
    ✓ should know the answer to life, the universe, and everything

    The End
      ✓ should print something
    1) should find all there is
    ✓ should calculate the worst first million years for marvin

  Phrasing
    ✓ should not panic
    ✓ should panic

  1) Calculations should find all there is
     54 == 42
AssertionError: 54 == 42
    at Context.<anonymous> (.../mocha/test2.js:5:9)
    ... // Abbreviated
```
You can see that the tests are running in parallel now. However, the ```Spec``` reporter prints the test-results as soon as it receives them from the test-clients, turning the output into a mess. This is the default behavior of most of the console reporters. We can change this behavior by setting the ```progress``` property to ```false```. When this flag is set to ```false```, the reporter will organize all test-results in a tree, printing them in an ordered manner just when Preceptor completes all tests.

To make it a little bit more interesting, let's add also the ```Duration``` reporter; it will print the total duration. The value of ```progress``` for the ```Duration``` reporter is by default ```false```, so no need to set this explicitly.
```javascript
module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec", "progress": false },
				{ "type": "List", "progress": false },
				{ "type": "Duration" }
			]
		}
	},

	// ...
};
```
The output is now:
```shell
  Everything
    ✓ should know the answer to life, the universe, and everything

    The End
      ✓ should print something

  Calculations
    1) should find all there is
    ✓ should calculate the worst first million years for marvin

  Phrasing
    ✓ should not panic
    ✓ should panic

  1) Calculations should find all there is
     54 == 42
AssertionError: 54 == 42
    at Context.<anonymous> (.../mocha/test2.js:5:9)
    ... // Abbreviated

Time: 531 milliseconds
```
The test-results are printed correctly now. Also, the duration is printed just as we wanted it.

With Preceptor, you can add as many reporters as you want, all of which are run at the same time - no matter if they are console or file reporters.

Let's add some file reporters: JUnit and TAP
```javascript
module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec", "progress": false },
				{ "type": "List", "progress": false },
				{ "type": "Duration" },
				{ "type": "Junit", path: "junit.xml" },
				{ "type": "Tap", path: "tap.txt" }
			]
		}
	},

	// ...
};
```
When running this configuration, two files will be created in the current working directory called ```junit.xml``` and ```tap.txt```, holding JUnit and TAP results respectively.

Now, I want to collect code-coverage reports from all the tests that were run. For that, add a ```coverage``` section to the global Preceptor configuration, activating it with ```active:true```, and may be supply additional configuration options.
```javascript
module.exports = {
	"configuration": {
		"reportManager": {
			"reporter": [
				{ "type": "Spec", "progress": false },
				{ "type": "List", "progress": false },
				{ "type": "Duration" },
				{ "type": "Junit", path: "junit.xml" },
				{ "type": "Tap", path: "tap.txt" }
			]
		},
		"coverage": {
			"active": true, // Activate coverage

			"path": "./coverage" // This is the default path

			// Add here any other coverage options.
			// See below for more information
		}
	},

  // ...
};
```
The output is now:
```shell
Everything
  ✓ should know the answer to life, the universe, and everything

  The End
    ✓ should print something

Calculations
  1) should find all there is
  ✓ should calculate the worst first million years for marvin

Phrasing
  ✓ should not panic
  ✓ should panic

1) Calculations should find all there is
   54 == 42
AssertionError: 54 == 42
  at Context.<anonymous> (.../mocha/test2.js:5:9)
  ... // Abbreviated

Time: 572 milliseconds


=============================== Coverage summary ===============================
Statements   : 96.3% ( 26/27 )
Branches     : 100% ( 0/0 )
Functions    : 92.31% ( 12/13 )
Lines        : 96.3% ( 26/27 )
================================================================================
```

By default, the coverage reporter creates three reports:
* ```text-summary``` - The short coverage summary in the console
* ```file``` - JSON file holding all coverage details, created in the ```path``` directory
* ```lcov``` - HTML report in the ```path``` directory

This concludes the introduction of Preceptor. Please read the general overview that follows, or refer to the API documentation that is included with this module.

## Usage

###Command-Line usage

Preceptor is started through the command-line that can be found in the ```bin``` folder. You can run the application with

```shell
preceptor [options] [config-file]
```

The ```config-file``` is by default ```rule-book.js``` or ```rule-book.json``` when left-off, where by the first one has priority over the second.

The command-line tool exposes a couple of flags and parameters:
```
--config j          Inline JSON configuration or configuration overwrites
--profile p         Profile of configuration
--subprofile p      Sub-profile of configuration
--version           Print version
--help              This help
```

For profiles, see the profile section below.

The ```config``` options adds the possibility to create or overwrite configuration directly from the console. The inline configuration-options are applied after the profile selection. 
Objects are merged if a configuration file was selected, and arrays will be appended to already available lists.

###Client-API

Preceptor injects an object (```PRECEPTOR```) into the gloabl scope.
* ```PRECEPTOR.config``` - Global configuration object from the Preceptor configuration

####Examples

The supplied configuration information is very helpful for test customization. 
For example, you might want to supply a different base-url for tests run locally or on a CI system, or you would want to customize browser window sizes. 

Here is an example for a Precpetor configuration file:
```javascript

module.exports = {

	"configuration": {
		"reportManager": {
			"reporter": [ { "type": "Spec", "progress": true } ]
		},
		"plugins": [ "preceptor-webdriver" ],

		"settings": { // Settings needed by the test-client
			"windowWidth": 1280, // Width of browser window
			"windowHeight": 768, // Height of browser window
			"webBaseUrl": "http://localhost" // Url of website
			// May be some other options - add whatever you want here. Preceptor will ignore unknown options.
		}
	},

	"tasks": [
		...
	]
};
```

In the client code then, you can gather this information like this:
```javascript
var settings = PRECEPTOR.config.settings;
var activeWindow = browser.activeWindow();

activeWindow.resize(settings.windowWidth, settings.windowHeight);
activeWindow.navigator.navigateTo(settings.webBaseUrl + '/order/324';
```

###Testing Lifecycle
To understand how Preceptor works, we have to understand first what the testing lifecycle is. Tests are run usually through a common set of states that can be defined as the testing lifecycle.

This include:
* start of all tests (not all frameworks support this)
* start of test suites
* start of tests
* end of tests (with different types of results)
* end of test suites
* end of all tests  (not all frameworks support this)

Each individual state will be triggered in Preceptor so that plugins can react on these state changes. This includes the reporter, the client, the client decorators, the tasks, and Preceptor itself.

Preceptor breaks them (and some additional states) into 4 groups:
* Admin - Administrative states
* Suite - Suite management
* Test - Test management
* Item - Item management for parts of a test

Let's describe them in more detail by describing their function and what information in conveyed.


####Administrative states
Administrative states will be triggered for events that change the collection and run behavior of Preceptor itself.


#####State: Start
The ```start``` state will be triggered just when Preceptor starts to run.

Parameters:
* __none__


#####State: Stop
The ```stop``` state will be triggered just when Preceptor completes all tests.

Parameters:
* __none__


#####State: Complete
The ```complete``` state will be triggered when Preceptor completed all the export jobs.

Parameters:
* __none__


####Suite management
These states handle any changes to test-suites.


#####State: Suite Start
The ```suiteStart``` state will be triggered when a new test-suite starts. Please be aware that it is possible to have test-suites within other test-suites.

Parameters:
* ```id``` - Identifier of test-suite. Preceptor creates a unique identifier for each state to be able to identifier related state changes.
* ```parentId``` - Parent identifier of parent test-suite. This makes it possible for Preceptor to create a tree of tests and test-suites. For the first test-suite, this will be the id of the ```start``` event.
* ```suiteName``` - Name of the suite that should be used for reporting.


#####State: Suite End
The ```suiteEnd``` state will be triggered when a test-suite completed.

Parameters:
* ```id``` - Identifier of test-suite, the same identifier that was given to ```suiteStart```.



####Test management
Test management states are states that transmit test and test-result information.

#####State: Test Start
The ```testStart``` state will be triggered when a new test starts.

Parameters:
* ```id``` - Identifier of test. Preceptor creates a unique identifier for each state to be able to identifier related state changes.
* ```parentId``` - Parent identifier of parent test-suite. This makes it possible for Preceptor to create a tree of tests and test-suites. For the first test without a parent test-suite, this will be the id of the ```start``` event.
* ```testName``` - Name of the test that should be used for reporting.


#####State: Test Passed
The ```testPassed``` state will be triggered when a test has passed.

Parameters:
* ```id``` - Identifier of test that was given to the related ```testStart```.


#####State: Test Failed
The ```testFailed``` state will be triggered when a test has failed. A failure is an unexpected test-result, often triggered by assertions.

Parameters:
* ```id``` - Identifier of test that was given to the related ```testStart```.
* ```message``` - Short description of the failure
* ```reason``` - Detailed description of the failure (often with stack-trace)


#####State: Test Error
The ```testError``` state will be triggered when a test had an error. An error is an unexpected exception that was not triggered by an assertion.

Parameters:
* ```id``` - Identifier of test that was given to the related ```testStart```.
* ```message``` - Short description of the error
* ```reason``` - Detailed description of the error (often with stack-trace)


#####State: Test Undefined
The ```testUndefined``` state will be triggered when a test hasn't been defined. This is triggered when the testing-framework recognizes a test, but could not find the test-implementation. Not all testing frameworks support this state.

Parameters:
* ```id``` - Identifier of test that was given to the related ```testStart```.


#####State: Test Skipped
The ```testSkipped``` state will be triggered when a test has been skipped. Tests are usually skipped when for example sub-systems that are dependencies for test are not available.

Parameters:
* ```id``` - Identifier of test that was given to the related ```testStart```.
* ```reason``` - Reason for skipping this test.


#####State: Test Incomplete
The ```testIncomplete``` state will be triggered when a test is available, but incomplete. This happens when tests are written, but are not completed yet.

Parameters:
* ```id``` - Identifier of test that was given to the related ```testStart```.


###Configuration

The configuration file has three top-level properties:
* ```configuration``` - Global Preceptor configuration that describes Preceptor behavior.
* ```shared``` - Shared task options.
* ```tasks``` - Individual task options which are run by default in sequence.

####Profiles
The configuration file supports multiple layers of profiles:
 * Global Profile
 * Tasks Profile

As an example, let's use the following abbreviated configuration:

__config.js__
```javascript
module.exports = {

	"configuration": {
		"reportManager": { "reporter": [ { "type": "Spec" } ] }
	},

	"tasks": [
		{
			"type": "mocha",
			"configuration": {
				"paths": [__dirname + "/mocha/test1.js"]
			}
		}
	]
};
```

#####Global Profile
Global profiles can be used to toggle between full-configurations:

```javascript
module.exports = {

	"profile1": {
		"configuration": {
			"reportManager": { "reporter": [ { "type": "Spec" } ] }
		},
	
		"tasks": [
			{
				"type": "mocha",
				"configuration": {
					"paths": [__dirname + "/mocha/test1.js"]
				}
			}
		]
	},

	"profile2": {
		"configuration": {
			"reportManager": { "reporter": [ { "type": "Dot" } ] }
		},
	
		"tasks": [
			{
				"type": "mocha",
				"configuration": {
					"paths": [__dirname + "/mocha/test2.js"]
				}
			}
		]
	}
};
```

To select the second profile, call Preceptor as follows:
```shell
preceptor --profile profile2 config.js
```

The first profile can be selected by supplying ```profile1``` instead, or whatever name you give the corresponding profiles.
Be sure to always supply a profile when it is available since the default behavior is to not look for a profile.

#####Tasks Profile
Task profiles are very similar to global profiles, but are there for toggling task-lists. This can be very useful, when global configurations are shared between multiple profiles. Task profiles are also called sub-profiles since they toggle configuration below the global profile selection.

An example looks like this:
```javascript
module.exports = {

	"configuration": {
		"reportManager": { "reporter": [ { "type": "Spec" } ] }
	},

	"tasks": {
	 	"sub-profile1": [
			{
				"type": "mocha",
				"configuration": {
					"paths": [__dirname + "/mocha/test1.js"]
				}
			}
		],
		"sub-profile2": [
			{
				"type": "mocha",
				"configuration": {
					"paths": [__dirname + "/mocha/test2.js"]
				}
			}
		]
	}
};
```

To select the first sub-profile, call Preceptor as follows:
```shell
preceptor --subprofile sub-profile1 config.js
```

Be sure to always supply a sub-profile when it is available since the default behavior is to not look for a sub-profile.

#####Combine Profiles
It is also possible to combine both profile methods.

```javascript
module.exports = {

	"ci": {
		"configuration": {
			"reportManager": { "reporter": [ { "type": "Dot" } ] }
		},
	
		"tasks": {
			"acceptance": [
				{
					"type": "mocha",
					"configuration": {
						"paths": [__dirname + "/build/mocha/test1.js"]
					}
				}
			],
			"integration": [
				{
					"type": "mocha",
					"configuration": {
						"paths": [__dirname + "/build/mocha/test2.js"]
					}
				}
			]
		}
	},
	"dev": {
		"configuration": {
			"reportManager": { "reporter": [ { "type": "Spec" } ] }
		},
	
		"tasks": {
			"acceptance": [
				{
					"type": "mocha",
					"configuration": {
						"paths": [__dirname + "/../mocha/test1.js"]
					}
				}
			],
			"integration": [
				{
					"type": "mocha",
					"configuration": {
						"paths": [__dirname + "/../mocha/test2.js"]
					}
				}
			]
		}
	}
};
```

With this example, you could run the acceptance tests from your local machine with:
```shell
preceptor --profile dev --subprofile acceptance config.js
```

####Global configuration
Preceptors task-independent behavior is configured in this section. It has the following properties:

* ```verbose``` - Flag for verbose output (default: false)
* ```reportManager``` - Reporting configuration
* ```reportManager.reporter``` - List of loaded reporters
* ```reportManager.listener``` - List of loaded listeners
* ```coverage``` - Coverage option
* ```plugins``` - List of plugin modules to load
* ```ignoreErrors``` - When set, errors that occur during testing will not be triggered on the Preceptor process (default: false)

######Reporting
The report manager describes what reporters should be used and what it should listen for to receive testing lifecycle events from unsupported clients.
See the ```preceptor-reporter``` project documentation for more information on the ```reportManager``` property.

######Coverage
Coverage report collection can be configured in this section. It has the following options:
* ```active``` - Flag that turns coverage collection on or off (default: false - off)
* ```root``` - Root of coverage data. This is used to reduce depth of coverage paths.
* ```path``` - Path to where the file coverage reports should be exported to.
* ```reports``` - List of reports to export to. (default: ['file', 'lcov', 'text-summary'])
* ```includes``` - List of patterns for files to include scripts into the coverage report. (default: ['**/*.js'])
* ```excludes``` - List of patterns to exclude files and directories of scripts that were previously whitelisted with the ```includes``` option. (default: ['**/node_modules/**', '**/test/**', '**/tests/**'])

This feature uses Istanbul for collecting and merging coverage reports. See the Istanbul project [website](https://github.com/gotwarlost/istanbul) for more information.

__Additional Reports__
Preceptor adds the ```file``` report to the list of reports to be able to disable the export of the JSON data. The ```file``` value will not be given to Istanbul since it is not available there.

####Shared configuration
Any value that is assigned to the 'shared' object in the configuration root will be assigned as default for all task options. Task options then can overwrite these values. This gives a developer the opportunity to set own default values for properties, overwriting the default values that were given by the system.

######Plugins
The Preceptor system supports the loading of custom plugins by installing the modules through NPM, and by adding the module name to this list. Preceptor then tries to load each of these modules by executing the ```loader``` function on the exported module interface, giving it the instance of Preceptor itself. The plugin can then register itself to Preceptor. See the ```preceptor-webdriver``` project for an example.

###Tasks

The following tasks for testing-frameworks are supported by default:
* Cucumber - Cucumber.js testing framework
* Mocha - Mocha unit testing framework
* Kobold - Kobold visual regression testing framework

Preceptor implements also some general purpose tasks:
* Node - Running node scripts
* Shell - Running shell scripts
* Group - Grouping tasks

The following sections describe the configuration and usage of these tasks

####General Configuration
Tasks have a common set of configuration options that can be set on the root of the task. Any custom configuration option, that will be listed for each task below, should be set on the ```configuration``` object instead of the root (see "Object and List Configuration"). The reason for this separation is flexibility for new features in future version of Preceptor without breaking any task or custom task that might add similar  named options.

#####Value Configuration
* ```taskId``` - Identifier of task. If none is given, then Preceptor will assign an identifier and may use it in error reports.
* ```type``` - Identifier for task-plugin. For example, ```type:'mocha'``` will use the Mocha task-plugin.
* ```name``` - Name of task. This is a more user friendly version of ```taskId```. If none is given, then it uses the ```taskId``` value.
* ```title``` - Description of task that might be used in test-results.

#####Object and List Configuration
* ```configuration``` - Custom configuration for task-specific options. See below for the task options.
* ```decorators``` - List of client decorators that should be loaded on the client. See "Client Decorators" section for more information.

#####Flag Configuration
* ```active``` - Flag that defines if task is active or inactive. Inactive tasks will be ignored by Preceptor, skipping any tests and results from the task. (default: true)
* ```suite``` - Flag that defines if task should be used as a virtual test-suite. A virtual test-suite injects itself into the test-results. This makes it possible to compose the test-results however it is needed. (default: false)
* ```debug``` - Flag that defines if task is run in debug mode. In debug-mode, the client is run directly in the Preceptor process. Output is not caught by Preceptor and directly printed to std-out, and a breakpoint will stop the Preceptor process. Avoid using this flag long-term. (default: false)
* ```report``` - Flag that determines if task uses the globally configured reporter. (default: true) If deactivated, testing life-cycle events will be muted. 
* ```coverage``` - Flag that determines if task uses the globally configured coverage collector. (default: false) If deactivated, collected coverage won't be merged 
* ```verbose``` - Prints every step taken by Preceptor. This adds a lot of output and might be overwhelming at first. (default: false)
* ```failOnError``` - Flag that defines if task should skip all other tests and fail Preceptor. (default: false)
* ```echoStdOut``` - Flag that defines if task should echo all std-out data.
* ```echoStdErr``` - Flag that defines if task should echo all std-err data.


####Cucumber Task

The ```type```-value for this task is ```cucumber```.

Task options:
* ```path``` - Path to the tests (required)
* ```tags``` - List of tags to accept. These can be strings with one tag, or an array of tags. These tags should have an '@' and may be the '~' if required. See Cucumber.js documentation for more information.
* ```format``` - Output format for test results (default: 'progress')
* ```functions``` - A list of functions to import (still WIP). The function can have a ```name``` property to be used in verbose logging.
* ```coffeScript``` - Flag that defines that output should be in coffee-script.


####Mocha Task

The ```type```-value for this task is ```mocha```.

Task options:
* ```reporters``` - Reporter to use (default: 'spec')
* ```ui``` - API interface to use (default: 'bdd')
* ```colors``` - Use colors in output (default: true)
* ```inlineDiff``` - Inline-diff support (default: false)
* ```slow``` - Defines how many milliseconds is considered as a slow test (default: 75)
* ```timeOuts``` - Specifies if time-outs should be enforced (default: true)
* ```timeOut``` - Describes when a test is considered to be in time-out (in milliseconds) (default: 2000)
* ```bail``` - Stop execution on the first error (default: false)
* ```grep``` - Filter to use for tests (default: false - off)
* ```invert``` - Invert ```grep``` filter (default: false)
* ```checkLeaks``` - Checks for memory leaks (default: false)
* ```asyncOnly``` - Enforce all tests to be asynchronous (default: false)
* ```globals``` - List of defined globals
* ```paths``` - A list of paths to the tests (default: ['test'])
* ```functions``` - A list of functions to import as tests. The function can have a ```name``` property to be used in verbose logging.
* ```recursive``` - Recursive search in the test paths (default: false)
* ```require``` - List of files to be require'd before tests run.
* ```sort``` - Sort tests before running the tests (default: false)


####Kobold Task

The ```type```-value for this task is ```kobold```.

Task options:
* ```verbose``` - Verbose output (default: true)
* ```failForOrphans``` - Flag that defines if Kobold should fail tests when Orphans are encountered. Orphans are screens that were previously approved, but are missing in the most recent test-run. This can be the case when tests are removed, or when the testing-framework was interrupted. (default: true)
* ```failOnAdditions``` - Flag that defines if Kobold should fail tests when Additions are encountered. Additions are screens that have never been seen (approved) before, but that are available during the most recent test-run. These usually happen when tests are added; these screens should be reviewed before approving. (default: true)
* ```build``` - Identifier for the current build. This can be an identifier from a CI or a random generated one. This value is used to distinguish multiple test-runs from each-other, and is given to the remote storage. (default: process.env.BUILD_NUMBER or process.env.USER + <timestamp>)
* ```blinkDiff``` - Configuration for the blink-diff tool.
* ```mocha``` - Mocha options for Kobold tests since it is build on-top of Mocha. (See above)
* ```storage``` - Storage configuration for Kobold. See the project website for more information.
* ```source``` - Source of screens. Uses ```storage``` as default. See the project website for more information.
* ```destination``` - Destination for screens. Uses ```storage``` as default. See the project website for more information.

The storage configuration has also the following values by default:
* ```type``` - 'File'
* ```options.approvedFolderName``` - 'approved'
* ```options.buildFolderName``` - 'build'
* ```options.highlightFolderName``` - 'highlight'


####Loader Task

This task imports already available test-report files, including JUnit and TAP files. The ```type```-value for this task is ```loader```.

Task options:
* ```format``` - Format of file-import (i.e. ```junit```, ```tap``` or ```istanbul```). See the [Preceptor-Reporter](http://yahoo.github.io/preceptor-reporter/#loader) project for all available options.
* ```path``` - Glob to select files that should be imported
* ```configuration``` - Custom configuration for each file-format type

__Example:__
```javascript
	{
		"type": "loader",
		"title": "JUnit import",
		"suite": true, // Wrap it in a suite using the title from above
		
		"configuration": { // Loader-task specific configuration
		
			"format": "junit", // Use "junit" as the format (is default)
			"path": "junit-*.xml", // Glob to select import files
			
			"configuration": {
				// Custom JUnit loader configuration
				"topLevel": false
			}
		}
	}
```

####Node Task

The ```type```-value for this task is ```node```.

Task options:
* ```path``` - Path to JavaScript file that should be executed. The JavaScript file will be running in its own process.


####Shell Task

The ```type```-value for this task is ```shell```.

Task options:
* ```cwd``` - Defines the current working directory for the script.
* ```env``` - List of key-value pairs (in an object) of environment variables set for the shell script. (default: {})
* ```cmd``` - Command to be executed in shell. The command will be run in its own process.


####Group Task

The ```type```-value for this task is ```group```.

Task options:
* ```parallel``` - Flag that defines if tasks should be run in parallel (default: false)
* ```tasks``` - List of task-options that should be run within this group.

The ```group``` Task Decorator uses this task to add the array-literal feature to the configuration.


###Task Decorators

A task decorator is a plugin that can modify task-options before they are applied. This makes the configuration very flexible as the whole configuration scheme can be changed with these plugins.

The following task decorators are build-in:
* ```group``` - Adds the array-literal feature for running tasks in parallel. It replaces the array-literal with a group that has the ```parallel``` flag set, injecting all the tasks into the ```task``` options of the group-task.
* ```identifier``` - Makes sure that identifiers are given for ```taskId```, ```name```, and ```title```. ```taskId``` will receive an unique id if not given, and all others might inherit the value if they are also missing - ```name``` from ```taskId``` and ```title``` from ```name```.


###Client Decorators

Client decorators are "tasks" that will be run in the client process by the client-runner. The decorators attach themselves to test-hooks that are triggered during the testing lifecycle (see above).

There are two types of hooks:
* Event hooks - Events that trigger without the possibility to halt the testing framework. Event hooks are triggered for all events during the testing lifecycle (see above).
* Activity hooks - Methods that are triggered that should return a Promise. This gives the client decorator the possibility to halt the testing framework for a while to execute some other tasks first.

There are four activity hooks:
* ```processBefore``` - Triggered once before a suite of tests.
* ```processBeforeEach``` - Triggered before each test-case.
* ```processAfterEach``` - Triggered after each test-case.
* ```processAfter``` - Triggered once after a suite of tests.

Out of the box, Preceptor supports the following client decorators:
* ```plain``` - Prints each of the triggers to the console. This client-decorator should be used for debugging purposes when creating client-decorators.

The ```preceptor-webdriver``` plugin adds the WebDriver client-decorator for injecting Selenium setup/tear-down code into the client.

Client decorators can be added to every task that supports the testing lifecycle events (generally all testing frameworks), and it is added through the ```decorators``` list in the task-options.

####Configuration
Client decorators has the following common options:
* ```type``` - Name of the plugin for client decorators
* ```configuration``` - Client decorator specific configuration

The general client decoration configuration namespace is reserved for future changes to all client decorators. Client decorator specific configuration should be described in ```configuration```.


###Client Runner
Clients are generally run in its own process. Each of these processes communicates with Preceptor, making it also possible to instruct the client to run client decorators in its process. For this to work, each testing-framework needs a client-runner. This is abstracted away, but is required when writing a plugin. The following client-runners are available:
* ```cucumber``` - Runs Cucumber.js
* ```mocha``` - Runs Mocha
* ```kobold``` - Runs Kobold. Uses internally the ```mocha``` client-runner.
* ```node``` - Runs Node.JS scripts

Please see the above files in the source-code for details on how to implement these. Much of the common behavior and the communication is implemented in the ```client.js``` file.


###Plugin Naming
The plugin module naming should follow the Grunt plugin naming convention. Plugins contributed by the community should have "contrib" in the module name (example: ```preceptor-contrib-hello-world```). Plugins that are supported by the Preceptor team will be named without the "contrib" keyword (example: ```preceptor-webdriver```).


##API-Documentation

Generate the documentation with following command:
```shell
npm run docs
```
The documentation will be generated in the ```docs``` folder of the module root.

##Tests

Run the tests with the following command:
```shell
npm run test
```
The code-coverage will be written to the ```coverage``` folder in the module root.

##Third-party libraries

The following third-party libraries are used by this module:

###Dependencies
* glob: https://github.com/isaacs/node-glob
* istanbul: https://github.com/gotwarlost/istanbul
* log4js: https://github.com/nomiddlename/log4js-node
* minimatch: https://github.com/isaacs/minimatch
* mkdirp: https://github.com/substack/node-mkdirp
* preceptor-core: https://github.com/yahoo/preceptor-core
* preceptor-reporter: https://github.com/yahoo/preceptor-reporter
* promise: https://github.com/then/promise
* underscore: http://underscorejs.org
* uuid: https://github.com/shtylman/node-uuid

###Dev-Dependencies
* chai: http://chaijs.com
* cucumber: http://github.com/cucumber/cucumber-js
* mocha: https://github.com/visionmedia/mocha
* cabbie: https://github.com/ForbesLindesay/cabbie
* kobold: https://github.com/yahoo/kobold
* preceptor-webdriver: https://github.com/yahoo/preceptor-webdriver
* yuidocjs: https://github.com/yui/yuidoc

##License

The MIT License

Copyright 2014 Yahoo Inc.
