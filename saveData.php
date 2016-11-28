<?php
	$id = $_POST['dateID'];
	$todos = $_POST['todos'];
	file_put_contents(getcwd() . '/data/' . $id . '.txt', $todos);
	echo getcwd() . '/data/' . $id . '.txt';
	echo $_POST['todos'];

	// var_dump($_POST);
?>