# 简单登录逻辑

## 题目描述
```
有这样一个同学，他想建立一个自己的网站，设计风格、功能什么的他都想好了，就差一个程序员了！
你作为他的好基友，精通前端技术，深知这样的网站工作量有多大。
但他目光死死地盯着你，你没有办法，只得勉勉强强含糊答应……
“好！那么我们现在就开工吧！做完请你吃饭！”
……
“网站嘛，首先得能登录，你先帮我做个登录页出来吧。”
一小时之后，你做好了页面和后端接口，现在还差一段前端 JS 脚本。
昨天晚上睡眠不足的你，感到倦意袭来，趴在桌子上决定小憩一会。
“或许…等我醒来时…有人已经帮我把脚本写完了呢……zzZZZ”
```

## 要求

* 脚本会在网页完全载入后运行。
* 用户点击 `Submit!` 按钮后，调用接口，得到返回后需要：
  * 将 `Status: NotLogin` 改成 `Status: LoggedIn`。
  * 在密码框和 `Submit!` 按钮之间插入一个 `div` 元素，内容是接口返回的 `message`。
  * 最后弹出一个 `alert`，内容任意，此时评测器会检查你的网页内容。
  
## 网页源码
```
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
```

## 后端接口

### **POST** `/api/login`

**参数**：
* **name**: 用户名
* **password**: 密码

**返回**：
```
{
	success: Boolean,
	message: String
}
```