import express = require('express');
import bodyParser = require('body-parser');
import webdriver = require('selenium-webdriver');
import crypto = require('crypto');
import fs = require('fs');
import path = require('path');

export class FrontEndTestFramework {
	public d = new webdriver.Builder()
		.forBrowser('firefox')
		.build();
	public e: express.Express = express();
	
	public inputHTML: string;
	public correctOutputHTML: string;

	private port: number;
	
	public constructor() {
		this.e.get("/", (req, res, next) => {
			res.type("html").end(this.inputHTML);
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
			this.e.listen(this.port, 'localhost', () => {
				this.d.get(this.homeURL);
				cb.apply(this);
			}).on('error', () => probe(cb));
		}
		this.e.use(express.static(staticRoot));
		return new Promise<void>(probe).catch(r => {
			console.log("Runtime Error");
			process.exit();
		});
	}
	
	public waitWithTimeout(cond: webdriver.until.Condition<webdriver.WebElement>) {
		return this.d.wait(cond, 2000).thenCatch(() => {
			console.log("Time Limit Exceeded");
			process.exit();
		});
	}
	
	public testEqualityAndEnd() {
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
					if (node1.textContent != node2.textContent)
						return false;
				} else
					for (var i = 0; i < node1.children.length; i++)
						if (!nodeEqual(node1.children[i], node2.children[i]))
							return false;
				
				return true;
			}
			
			return nodeEqual(doc.body, document.body);
		}, this.correctOutputHTML).then(result => {
			if (result)
				console.log('Accepted');
			else
				console.log('Wrong Answer');
		});
		this.d.quit().then(() => process.exit());
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
	return fs.readFileSync(path.join(__dirname, process.argv.pop())).toString();
};
export var By = webdriver.By;
export var until = webdriver.until;