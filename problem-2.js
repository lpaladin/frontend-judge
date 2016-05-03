"use strict";

const framework = require('./framework');
var until = framework.until;
let fw = new framework.FrontEndTestFramework();
fw.testSuite = framework.readTestSuite(3);
fw.eachIteration(i => {
    fw.runUserScript();
    fw.waitWithTimeout(until.alertIsPresent());
});
fw.startServer().then(() => fw.runTest());
//# sourceMappingURL=problem-2.js.map