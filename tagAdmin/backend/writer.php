<?php
if(isset($_POST["data"])){
$arr = explode(",",$_POST["data"]);
$pos = 0;
if(isset($arr) && sizeof($arr > 0)){
$jsonString = "{\"data\":[";
foreach($arr as $i){
	$jsonString.="\"#".$i."\"";
	if($pos < sizeof($arr)-1){
		$jsonString.=",";
	}
	$pos++;
}
$jsonString.="]}";
	file_put_contents("../../node/tags.json",$jsonString);
echo("{\"code\":\"[file created]\",\"response\":\"File has been created. Edit away.\"}");
}
}
else{
echo("{\"code\":\"[file not created]\",\"response\":\"Something went wrong.\"}");
}
?>