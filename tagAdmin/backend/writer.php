<?php
if(isset($_GET["locations"])){
		$tested = json_decode($_GET["locations"],true);	
		$newThings = array();
		foreach($tested as $ind=>$value){
			if(isset($value["grouptag"])){
				if(!isset($newThings[$value["grouptag"]])){
					$newThings[$value["grouptag"]] = array();
				}	
				if(!in_array($ind, $newThings[$value["grouptag"]])){
					array_push($newThings[$value["grouptag"]],$ind);
				}
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
				if(!isset($newThings[$value["grouptag"]])){
					$newThings[$value["grouptag"]] = array();
				}	
				if(!in_array($ind, $newThings[$value["grouptag"]])){
					array_push($newThings[$value["grouptag"]],$ind);
				}
			}
		}
		$json["data"]["optionaltags"] = $newThings;
	}
	if(isset($_POST["location"])){
	$arr = explode(",",$_POST["location"]);
		foreach($arr as $index=>$val){
			$arr[$index] = "#".$val;
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