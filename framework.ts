import express = require('express');
import bodyParser = require('body-parser');
import webdriver = require('selenium-webdriver');
import crypto = require('crypto');
import fs = require('fs');
import path = require('path');

interface ITestSuite {
	inputHTMLs: string[];
	correctOutputHTMLs: string[];
	length: number;
}

process.on('uncaughtException', ex => {
	console.log("Runtime Error");
	console.log("TestFramework exception:", ex);
	process.exit();
})

export class FrontEndTestFramework {
	public d = new webdriver.Builder()
		.forBrowser('firefox')
		.build();
	public e: express.Express = express();
	
	public currentProgress: number = 0;
	public testSuite: ITestSuite = {
		inputHTMLs: [],
		correctOutputHTMLs: [],
		length: 0
	};

	private port: number;
	private fnIteration: (iteration: number) => void;
	
	public constructor() {
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

	public startServer({ 
		staticRoot = "./static/",
		portMaxTrial = 10
	} = {}) {
		let trialLeft = portMaxTrial;
		let probe = cb => {
			if (--trialLeft == 0)
				throw "Unable to find a free port for server";
			this.port = Math.round(Math.random() * 8192 + 8192);
			this.e.listen(this.port, 'localhost', cb.bind(this))
				.on('error', () => probe(cb));
		}
		this.e.use(express.static(staticRoot));
		return new Promise<void>(probe);
	}
	
	public set inputHTML(html: string) {
		this.testSuite.inputHTMLs = [html];
		this.testSuite.length = 1;
	}
	public set correctOutputHTML(html: string) {
		this.testSuite.correctOutputHTMLs = [html];
		this.testSuite.length = 1;
	}
	
	public eachIteration(documentReady: (iteration: number) => void) {
		if (documentReady instanceof Function)
			this.fnIteration = documentReady;
	}
	
	public waitWithTimeout(cond: webdriver.until.Condition<webdriver.WebElement>) {
		return this.d.wait(cond, 2000).thenCatch(ex => {
			console.log("Time Limit Exceeded");
			console.log(this.currentProgress + "/" + this.testSuite.length);
			process.exit();
		});
	}
	
	public runUserScript() {
		return this.d.executeScript(readScript()).thenCatch(ex => {
			console.log("Runtime Error");
			console.log("User script exception:", ex);
			process.exit();
		});
	}
	
	public runTest() {
		for (var i = 0; i < this.testSuite.length; i++) {
			this.d.get(this.homeURL);
			this.d.call(this.fnIteration.bind(this, i));
			this.d.executeScript<boolean>(function (answer) {
				// 在浏览器上执行的判断脚本
				var doc = document.implementation.createHTMLDocument("");
				doc.documentElement.innerHTML = answer;
				
				function nodeEqual(node1, node2) {
					if (node1.tagName != node2.tagName)
						return false;
						
					var attr1 = node1.attributes, attr2 = node2.attributes;
					for (var i = 0; i < attr1.length; i++)
						if (attr1[i].specified) {
							var that = attr2.getNamedItem(attr1[i].name);
							if (!that || that.value != attr1[i].value)
								return false;
						}
					for (var i = 0; i < attr2.length; i++)
						if (attr2[i].specified) {
							var that = attr1.getNamedItem(attr2[i].name);
							if (!that || that.value != attr2[i].value)
								return false;
						}
						
					if (!node1.children || !node2.children ||
						node1.children.length != node2.children.length)
						return false;
						
					if (node1.children.length == 0) {
						if (node1.textContent.trim() != node2.textContent.trim())
							return false;
					} else
						for (var i = 0; i < node1.children.length; i++)
							if (!nodeEqual(node1.children[i], node2.children[i]))
								return false;
					
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
		})
	}

	public get homeURL() {
		return `http://localhost:${this.port}/`;
	}
};

export function md5(str: string) {
	let h = crypto.createHash('md5');
	h.update(str);
	return h.digest('hex');
};
export function randStr() {
	return md5((Date.now() + Math.random()).toString());
};
export function readScript() {
	return fs.readFileSync(path.join(__dirname, process.argv[2])).toString();
};
export function readTestSuite(count: number) {
	let prefix = path.join(__dirname, path.basename(process.argv[1], ".js"));
	let suite: ITestSuite = {
		inputHTMLs: [],
		correctOutputHTMLs: [],
		length: count
	};
	try {
		for (var i = 0; i < count; i++) {
			suite.inputHTMLs[i] = fs.readFileSync(`${prefix}.in.${i}.html`).toString();
			suite.correctOutputHTMLs[i] = fs.readFileSync(`${prefix}.out.${i}.html`).toString();
		}
	} catch (ex) {
		console.log("Runtime Error");
		console.log("Bad test suite");
		process.exit();
	}
	return suite;
};
export var By = webdriver.By;
export var until = webdriver.until;