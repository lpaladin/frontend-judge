# frontend-judge
web前端编程题目的Judge（基于selenium），可以作为special judge与传统oj进行对接。包括一个小型临时评测服务器。

用户提交的是前端js代码，该Judge根据题目要求判断对错（是否达到了题目要求的效果）。

编写题目需要编写TypeScript代码来完成题目的控制逻辑。

附带了样例题目（problem-1和problem-2），包括题目的
* 逻辑（.ts）
* 题目描述（.md）
* 可选：输入输出数据（.in.*.html，.out.*.html）
* 正确和错误的样例代码（bad-submission-*.js，correct-submission-*.js）
