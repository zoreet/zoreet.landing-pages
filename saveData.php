<?php
	$id = $_POST['dateID'];
	$todos = $_POST['todos'];
	file_put_contents('./data/' . $id . '.txt', $todos);
	echo './data/' . $id . '.txt';

	// var_dump($_POST);
?>