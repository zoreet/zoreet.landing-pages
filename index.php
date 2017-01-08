<?php date_default_timezone_set('UTC'); ?>
<!DOCTYPE html>
<html>
<head>
	<title>today</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="static/css/style.css">

	<link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
	<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
	<link rel="apple-touch-icon" href="/apple-touch-icon.png">
	<link rel="manifest" href="/manifest.json">
	<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ffffff">
	<meta name="theme-color" content="#ffffff">

	<link rel="manifest" href="manifest.json">
	<link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5">
	<meta name="theme-color" content="#ffffff">
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