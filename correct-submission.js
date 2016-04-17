$(".submit-btn").one("click", function () {
	$.post("/api/login", {
		name: $("#user-name").val(),
		password: $("#user-password").val()
	}, function (response) {
		$("body > div:first-child > div:last-child > span").text("Status: Loggedin");
		$("#user-password").after("<div>" + response.message + "</div>");
		alert();
	}, "json");
});