<?php
	$id = $_POST['dateID'];
	$file = './data/' . $id . '.txt';
	if( file_exists($file) ) {
		echo htmlspecialchars( file_get_contents($file), ENT_QUOTES );
	}
?>