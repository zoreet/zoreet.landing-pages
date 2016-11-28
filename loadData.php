<?php
	$id = $_POST['dateID'];
	$file = getcwd() . '/data/' . $id . '.txt';
	if( file_exists($file) ) {
		echo htmlspecialchars( file_get_contents($file), ENT_QUOTES );
	} else {
		echo $file;
	}
?>