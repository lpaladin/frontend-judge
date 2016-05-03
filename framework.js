"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const webdriver = require('selenium-webdriver');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
process.on('uncaughtException', ex => {
    console.log("Runtime Error");
    console.log("TestFramework exception:", ex);
    process.exit();
});
class FrontEndTestFramework {
    constructor() {
        this.d = new webdriver.Builder().forBrowser('firefox').build();
        this.e = express();
        this.currentProgress = 0;
        this.testSuite = {
            inputHTMLs: [],
            correctOutputHTMLs: [],
            length: 0
        };
        if (!fs.existsSync(process.argv[2])) {
            console.log("Runtime Error");
            console.log("You may want to append <path/to/user/script.js> as an argument.");
            process.exit();
        }
        this.e.get("/", (req, res, next) => {
            res.type("html").end(this.testSuite.inputHTMLs[this.currentProgress]);
        });
        this.e.use(bodyParser.urlencoded({ extended: false }));
    }
    startServer() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$staticRoot = _ref.staticRoot;
        let staticRoot = _ref$staticRoot === undefined ? "./static/" : _ref$staticRoot;
        var _ref$portMaxTrial = _ref.portMaxTrial;
        let portMaxTrial = _ref$portMaxTrial === undefined ? 10 : _ref$portMaxTrial;

        let trialLeft = portMaxTrial;
        let probe = cb => {
            if (--trialLeft == 0) throw "Unable to find a free port for server";
            this.port = Math.round(Math.random() * 8192 + 8192);
            this.e.listen(this.port, 'localhost', cb.bind(this)).on('error', () => probe(cb));
        };
        this.e.use(express.static(staticRoot));
        return new Promise(probe);
    }
    set inputHTML(html) {
        this.testSuite.inputHTMLs = [html];
        this.testSuite.length = 1;
    }
    set correctOutputHTML(html) {
        this.testSuite.correctOutputHTMLs = [html];
        this.testSuite.length = 1;
    }
    eachIteration(documentReady) {
        if (documentReady instanceof Function) this.fnIteration = documentReady;
    }
    waitWithTimeout(cond) {
        return this.d.wait(cond, 2000).thenCatch(ex => {
            console.log("Time Limit Exceeded");
            console.log(this.currentProgress + "/" + this.testSuite.length);
            process.exit();
        });
    }
    runUserScript() {
        return this.d.executeScript(readScript()).thenCatch(ex => {
            console.log("Runtime Error");
            console.log("User script exception:", ex);
            process.exit();
        });
    }
    runTest() {
        for (var i = 0; i < this.testSuite.length; i++) {
            this.d.get(this.homeURL);
            this.d.call(this.fnIteration.bind(this, i));
            this.d.executeScript(function (answer) {
                // 在浏览器上执行的判断脚本
                var doc = document.implementation.createHTMLDocument("");
                doc.documentElement.innerHTML = answer;
                function nodeEqual(node1, node2) {
                    if (node1.tagName != node2.tagName) return false;
                    var attr1 = node1.attributes,
                        attr2 = node2.attributes;
                    for (var i = 0; i < attr1.length; i++) if (attr1[i].specified) {
                        var that = attr2.getNamedItem(attr1[i].name);
                        if (!that || that.value != attr1[i].value) return false;
                    }
                    for (var i = 0; i < attr2.length; i++) if (attr2[i].specified) {
                        var that = attr1.getNamedItem(attr2[i].name);
                        if (!that || that.value != attr2[i].value) return false;
                    }
                    if (!node1.children || !node2.children || node1.children.length != node2.children.length) return false;
                    if (node1.children.length == 0) {
                        if (node1.textContent.trim() != node2.textContent.trim()) return false;
                    } else for (var i = 0; i < node1.children.length; i++) if (!nodeEqual(node1.children[i], node2.children[i])) return false;
                    return true;
                }
                return nodeEqual(doc.body, document.body);
            }, this.testSuite.correctOutputHTMLs[i]).then(result => {
                if (!result) {
                    console.log('Wrong Answer');
                    console.log(this.currentProgress + "/" + this.testSuite.length);
                    process.exit();
                }
                this.currentProgress++;
            }).thenCatch(ex => {
                console.log("Runtime Error");
                console.log("Evaluation script exception:", ex);
                process.exit();
            });
        }
        this.d.quit().then(() => {
            console.log("Accepted");
            process.exit();
        });
    }
    get homeURL() {
        return `http://localhost:${ this.port }/`;
    }
}
exports.FrontEndTestFramework = FrontEndTestFramework;
;
function md5(str) {
    let h = crypto.createHash('md5');
    h.update(str);
    return h.digest('hex');
}
exports.md5 = md5;
;
function randStr() {
    return md5((Date.now() + Math.random()).toString());
}
exports.randStr = randStr;
;
function readScript() {
    return fs.readFileSync(path.join(__dirname, process.argv[2])).toString();
}
exports.readScript = readScript;
;
function readTestSuite(count) {
    let prefix = path.join(__dirname, path.basename(process.argv[1], ".js"));
    let suite = {
        inputHTMLs: [],
        correctOutputHTMLs: [],
        length: count
    };
    try {
        for (var i = 0; i < count; i++) {
            suite.inputHTMLs[i] = fs.readFileSync(`${ prefix }.in.${ i }.html`).toString();
            suite.correctOutputHTMLs[i] = fs.readFileSync(`${ prefix }.out.${ i }.html`).toString();
        }
    } catch (ex) {
        console.log("Runtime Error");
        console.log("Bad test suite");
        process.exit();
    }
    return suite;
}
exports.readTestSuite = readTestSuite;
;
exports.By = webdriver.By;
exports.until = webdriver.until;
//# sourceMappingURL=framework.js.map