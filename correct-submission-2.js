$("ul").each(function () {
	var $this = $(this);
	$this.append($this.find("li").sort(function (a, b) {
		var sa = a.textContent.trim(),
			sb = b.textContent.trim();
		if (sa == sb)
			return 0;
		if (sa > sb)
			return 1;
		return -1;
	}));
});
alert();