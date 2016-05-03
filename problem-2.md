# 简单元素排序

## 题目描述
```
话说这世上有着无数的隔壁老王，每个隔壁老王都有属于自己的故事。
这日，有心人搞到了他们的知己列表，像这样：

【老王1】
知己1
知己2
知己3
【老王2】
知己A
知己B
知己C
……

为了便于确定自己帽子的颜色，并且准备好合适尺寸的砍刀，你需要帮他给每个老王的知己按照字典序从小到大排序。
```

## 要求

* 脚本会在网页完全载入后运行。
* 需要对每个ul元素的li在这个ul里进行排序
  * 排序前请除去前后空格，然后按照字典序从小到大排序
  * 最后弹出一个 `alert`，内容任意，此时评测器会检查你的网页内容。
  
## 样例网页源码

### 输入
```
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="utf-8" />
	<title>OldWang'sSecretList</title>
	<script src="/jquery-1.9.1.min.js"></script>
</head>
<body>
	<ul>
		<li>5326
		<li>23333
		<li>2333
	</ul>
	<ul>
		<li>小白
		<li>小绿
		<li>小红
	</ul>
</body>
</html>
```

### 输出
```
<html xmlns="http://www.w3.org/1999/xhtml"><head>
	<meta charset="utf-8">
	<title>OldWang'sSecretList</title>
	<script src="/jquery-1.9.1.min.js"></script>
</head>
<body>
	<ul>
		<li>2333
		<li>23333
		<li>5326
	</ul>
	<ul>
		<li>小白
		<li>小红
		<li>小绿
	</ul>
</body>
</html>
```