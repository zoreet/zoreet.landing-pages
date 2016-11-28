<?php date_default_timezone_set('UTC'); ?>
<!DOCTYPE html>
<html>
<head>
	<title>today</title>
	<link rel="stylesheet" type="text/css" href="static/css/style.css">
</head>
<body>
	<h1></h1>
	<div class="jumpto">Jump to:
		<a href="" id="yesterday">Yesterday</a>
		<a href="" id="today">Today</a>
		<a href="" id="tomorrow">Tomorrow</a>
	</div>
	<div id="todos" contenteditable="true"><div>Here</div></div>
	<div id="TodayItem--template" style="display: none">
		<div class='todo_item'>
			<a href='#' class='todo_item__icon todo_item__check'>&#10003;</a>
			<div class='input' contenteditable></div>
		</div>
	</div>

	<footer>
		today - web based to-do list where every day is a new start.
		Made with <span class="heart">&hearts;</span> by <a href="http://zoreet.com">zoreet</a>.
	</footer>
</body>
	<script type="text/javascript" src="static/js/jquery-3.1.1.min.js"></script>
	<script type="text/javascript" src="static/js/moment.min.js"></script>
	<script type="text/javascript" src="static/js/todayApp.js"></script>
</html>