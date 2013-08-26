<?php
$possibleCommands = array("start", "end", "force", "check", "teapot");
if (!isset($_REQUEST["command"])) {
	echo("{\"code\":\"[no command]\",\"response\":\"Ask me to do something.\"}");
} else {
	if (!in_array($_REQUEST["command"], $possibleCommands)) {
		echo("{\"code\":\"[command not found]\",\"response\":\"No, I won't do that.\"}");
	} else {
		if ($_SERVER["REQUEST_METHOD"] == "POST") {
			if ($_POST["command"] == $possibleCommands[0]) {//start
				$fileFound = json_decode(fileCheck(), true);
				if ($fileFound["response"] == false) {
					file_put_contents("check.json", "{\"timestamp\":" . date_timestamp_get(date_create()) . "000}");
					echo("{\"code\":\"[file created]\",\"response\":\"File has been created. Edit away.\"}");
				} else {
					echo(fileCheck());
				}
			} else if ($_POST["command"] == $possibleCommands[1]) {//end
				if (file_exists("check.json")) {
					unlink("check.json");
					echo("{\"code\":\"[file deleted]\",\"response\":\"File has been deleted. Session terminated.\"}");
				} else {
					echo("{\"code\":\"[file not deleted]\",\"response\":\"You silly goose; there's nothing to delete!\"}");
				}

			} else if ($_POST["command"] == $possibleCommands[2]) {//force
			unlink("check.json");
				file_put_contents("check.json", "{\"timestamp\":" . date_timestamp_get(date_create()) . "000}");
				echo("{\"code\":\"[file forced]\",\"response\":\"File has been overwritten. Edit away.\"}");
			}
		} else {
			if ($_REQUEST["command"] == $possibleCommands[3]) {//check
				echo(fileCheck());
			} else if ($_REQUEST["command"] == $possibleCommands[sizeof($possibleCommands) - 1] || $_REQUEST["command"] == "tea,earl_grey,hot") {
				echo("{\"code\":\"[Error 418]\",\"response\":\"I\"m a little teapot\n
		Short and Stout.
Here is my handle;
Here is my spout.
When I get all steamed up,
I just shout;
Tip me over and pour me out.\"}");
			} else if (in_array($_REQUEST["command"], $possibleCommands)) {
				echo("{\"code\":\"[Wrong Method Type]\",\"response\":\"Wrong method type for this call.\"}");
			}
		}
	}
}

function fileCheck() {
	$rVal = "";
	if (file_exists("check.json")) {
		$checkFile = file_get_contents("check.json");
		$rVal = "{\"code\":\"[check file open]\",\"response\":true,\"data\":" . $checkFile . "}";
		return $rVal;
	} else {
		$rVal = "{\"code\":\"[no check file]\",\"response\":false}";
		return $rVal;
	}
}
?>