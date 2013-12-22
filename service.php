<?php 
	/*
	Config proxy service 
	Reads .conf file and transforms it into json
	Solves the problem with cross domain ajax requests.
	Game page runs ajax request to get config from this php proxy.
	
	Markus Östberg
	2013-03-21
	*/
	
	//Read config file 
	$configstring = file_get_contents('http://labs.funspot.tv/worktest_color_memory/colours.conf');
	$configarray = explode("\n", $configstring);
	
	//Build JSON Object
	$json = "{";
	$json = $json . '"Colours":[';
	
	foreach ($configarray as &$value) {
        $value = trim($value);
		$value = explode(';', $value); //Remove comments
		$value = trim($value[0]);
		if(strlen($value) > 1)
			$json = $json . '"' . $value . '"' . ',';
    }
	
	$json = rtrim($json, ",");
	$json = $json . "]";
	$json = $json . "}";
	
	echo $json;
	
?> 