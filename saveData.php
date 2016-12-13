<?php
	$id = $_POST['dateID'];
	$todos = $_POST['todos'];
	$user = $_SERVER['PHP_AUTH_USER'];
	$result = file_put_contents(getcwd() . '/data/' . $user . '/' . $id . '.txt', $todos);
	if($result !== false) {
		//success
		header("Status: 200");
		echo json_encode(array(
        	result => "Data saved!",
        	code => 200
    	));
	} else {
		// fail
		echo json_encode(array(
        	result => "I can't write to that file.",
        	code => 502
    	));
	}
?>