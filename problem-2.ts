import framework = require('./framework');
import By = framework.By;
import until = framework.until;

let fw = new framework.FrontEndTestFramework();

fw.testSuite = framework.readTestSuite(3);

fw.eachIteration(i => {
	fw.runUserScript();
	fw.waitWithTimeout(until.alertIsPresent());
});

fw.startServer().then(() => fw.runTest());