<?php date_default_timezone_set('UTC'); ?>
<!DOCTYPE html>
<html>
<head>
	<title>today</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="static/css/style.css">

	<link rel="icon" type="image/png" href="/static/img/favicon/favicon-16x16.png" sizes="16x16">
	<link rel="apple-touch-icon" sizes="180x180" href="/static/img/favicon/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/static/img/favicon/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/static/img/favicon/favicon-16x16.png">
	<link rel="manifest" href="/static/img/favicon/manifest.json">
	<link rel="mask-icon" href="/static/img/favicon/safari-pinned-tab.svg" color="#29e5c9">
	<meta name="theme-color" content="#ffffff">
</head>
<body>
	<div class="jumpto">
		<a href="" id="yesterday"></a>
		<a href="" id="tomorrow"></a>
		<!-- <a href="" id="today">Today</a> -->
		<h1></h1>
	</div>
	<div class="body">
		<div id="todos" contenteditable="true"><div>Here</div></div>
		<div id="TodayItem--template" style="display: none">
			<div class='todo_item'>
				<a href='#' class='todo_item__icon todo_item__check'>&#10003;</a>
				<div class='input' contenteditable></div>
			</div>
		</div>
	</div>

	<footer>
		today - web based to-do list where every day is a new start.
		Made with <span class="heart">&hearts;</span> by <a href="http://zoreet.com">zoreet</a>.
	</footer>
</body>
	<script type="text/javascript" src="static/js/jquery.min.js"></script>
	<script type="text/javascript" src="static/js/moment.min.js"></script>
	<script type="text/javascript" src="static/js/todayApp.js"></script>
	<script type="text/javascript">
		$(document).ready(function(){
			today.init("<?php echo $_GET['date']; ?>")
		});
	</script>
</html>