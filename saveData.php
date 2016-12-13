<?php
	$id = $_POST['dateID'];
	$todos = $_POST['todos'];
	$user = $_SERVER['PHP_AUTH_USER'];
	file_put_contents(getcwd() . '/data/' . $user . '/' . $id . '.txt', $todos);
	echo getcwd() . '/data/' . $user . '/' . $id . '.txt';
	echo $_POST['todos'];

	// var_dump($_POST);
?>