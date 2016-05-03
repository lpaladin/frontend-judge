import framework = require('./framework');
import By = framework.By;
import until = framework.until;

let fw = new framework.FrontEndTestFramework();
let keys = [
	framework.randStr(),
	framework.randStr(),
	framework.randStr()
];

fw.inputHTML = `
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="utf-8" />
	<title>Login</title>
	<script src="/jquery-1.9.1.min.js"></script>
</head>
<body>
	<div>
		<span>LOGO</span>
		<div>
			<a href="/">HOME</a>
			<a href="/about">ABOUT</a>
		</div>
		<div>
			<span>Status: NotLogin</span>
		</div>
	</div>
	<div class="page-content">
		<div>
			<input id="user-name" type="text" />
			<input id="user-password" type="text" />
			<a class="submit-btn" href="javascript: void(0)">Submit</a>
		</div>
	</div>
</body>
</html>
`;

fw.correctOutputHTML = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head>
	<meta charset="utf-8" />
	<title>Login</title>
	<script src="/jquery-1.9.1.min.js"></script>
</head>
<body>
	<div>
		<span>LOGO</span>
		<div>
			<a href="/">HOME</a>
			<a href="/about">ABOUT</a>
		</div>
		<div>
			<span>Status: Loggedin</span>
		</div>
	</div>
	<div class="page-content">
		<div>
			<input type="text" id="user-name" />
			<input type="text" id="user-password" />
			<div>${keys[2]}</div>
			<a href="javascript: void(0)" class="submit-btn">Submit</a>
		</div>
	</div>
</body>
</html>
`;

fw.e.post("/api/login", (req, res, next) => {
	let { name, password } = req.body;
	if (name == keys[0] && password == keys[1])
		return res.json({ success: true, message: keys[2] });
	return res.json({ success: false });
});

fw.eachIteration(i => {
	fw.runUserScript();
	fw.d.findElement(By.id('user-name')).sendKeys(keys[0]);
	fw.d.findElement(By.id('user-password')).sendKeys(keys[1]);
	fw.d.findElement(By.className("submit-btn")).click();
	fw.waitWithTimeout(until.alertIsPresent());
});

fw.startServer().then(() => fw.runTest());