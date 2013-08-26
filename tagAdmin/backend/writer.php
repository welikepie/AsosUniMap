<?php
if(isset($_POST["location"])||isset($_POST["campaign"])){
$json = json_decode(file_get_contents("../../node/tags.json"),true);
	//echo($json);

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