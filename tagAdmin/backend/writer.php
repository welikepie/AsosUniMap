<?php
if(isset($_GET["locations"])){
		$tested = json_decode($_GET["locations"],true);	
		$newThings = array();
		foreach($tested as $ind=>$value){
			if(isset($value["grouptag"])){
				
				if(!isset($newThings[$ind])){
					$newThings[$ind] = "";
				}	
				$newThings[$ind] = $value["grouptag"];
			}
		}
		var_dump($newThings);
	}

if((isset($_POST["location"])&&isset($_POST["locations"]))||isset($_POST["campaign"])){
$json = json_decode(file_get_contents("../../node/tags.json"),true);
	//echo($json);

	if(isset($_POST["locations"])){
		$json["data"]["locations"] = json_decode($_POST["locations"],true);	
	
		$tested = $json["data"]["locations"];	
		$newThings = array();
		foreach($tested as $ind=>$value){
			if(isset($value["grouptag"])){
				
				if(!isset($newThings[$ind])){
					$newThings[$ind] = "";
				}	
				$newThings[$ind] = $value["grouptag"];
			}
		}
		$json["data"]["optionaltags"] = $newThings;
	}
	if(isset($_POST["location"])){
	$arr = explode(",",$_POST["location"]);
		foreach($arr as $index=>$val){
			$arr[$index] = "#".$val;
		if(!file_exists("../../node/jsons/".$val.".json")){
			file_put_contents("../../node/jsons/".$val.".json",'{"tag":"'.$val.'","timestamp":0,""length":0,"answers":[]}');
		}			
		}
	$json["data"]["location"] = $arr;
	}
	if(isset($_POST["campaign"])){
	$arr = explode(",",$_POST["campaign"]);
		foreach($arr as $index=>$val){
			$arr[$index] = "#".$val;
		}
	$json["data"]["campaign"] = $arr;
	}

	file_put_contents("../../node/tags.json",json_encode($json));
	echo("{\"code\":\"[file created]\",\"response\":\"File has been created. Edit away.\"}");

}
else{
echo("{\"code\":\"[file not created]\",\"response\":\"Something went wrong.\"}");
}
?>