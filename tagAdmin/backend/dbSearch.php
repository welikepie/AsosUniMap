<?php
require_once 'dbCreds.php';
$DBToUse = $devCredsLocal; //devCreds;
$db      = null;
$results = array(array(),array());
if (!defined('JSON_PRETTY_PRINT')) {
    define('JSON_PRETTY_PRINT', 0);
}
set_error_handler(function($errno, $errstr, $errfile, $errline)
{
    throw new ErrorException($errstr, $errno, 0, $errfile, $errline);
});
if (isset($_POST["writes"])) {
	open_db($DBToUse);
    $toWrite = explode(",", $_POST["writes"]);
    $queryToUse = "UPDATE content SET visible = CASE WHEN ";
	$newAddition = "";
    foreach ($toWrite as $perk => $val) {
        if(strlen($newAddition) > 0 && substr($newAddition, -2)!= "OR"){
        	$newAddition .= " OR";
        }
		$newAddition .= " id = '".$val."'";
	}
//	echo($newAddition);
    $queryToUse.=$newAddition;
	$queryToUse.="THEN 1 ELSE 0 END";
	execute_query($queryToUse,function($row){});
	close_db();
}
//var_dump($_POST);
if (isset($_POST["query"])) {
    open_db($DBToUse);
    $queryToUse = "SELECT id,user,name,source,visible,text,UNIX_TIMESTAMP(time) as time FROM content";
    if (isset($_POST["query"])) {
        $queryToUse .= " WHERE text like '%" . $_POST["query"] . "%'";
		$queryToUse .= " OR user like '%" . $_POST["query"] . "%'";
    }
    execute_query($queryToUse, function($row)
    {
        array_push($GLOBALS["results"][0], $row);
    });
	   execute_query("SELECT id FROM content WHERE visible = '1'", function($row)
    {
        array_push($GLOBALS["results"][1], $row["id"]);
    });
	
	
    close_db();
    header('HTTP/1.1 200 OK', true, 200);
    header('Content-Type: ' . (isset($_GET['callback']) ? 'text/javascript' : 'application/json; charset=utf-8'));
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    if (isset($_GET['callback'])) {
        $content = $_GET['callback'] . '(' . JSON_ENCODE($GLOBALS["results"], JSON_PRETTY_PRINT) . ');';
    } else {
        echo (JSON_ENCODE($GLOBALS["results"], JSON_PRETTY_PRINT));
    }
}
else{
	if (isset($_GET['callback'])) {
        $content = $_GET['callback'] . '([]);';
    } else {
        echo ("[]");
    }
}
function open_db($arr)
{
    try {
        $GLOBALS["db"] = new mysqli($arr["host"], $arr["user"], $arr["pass"], $arr["db"], $arr["port"]);
        if ($GLOBALS["db"]->connect_error) {
            throw new Exception(sprintf('[%d] %s', $GLOBALS["db"]->connect_errno, $GLOBALS["db"]->connect_error));
        }
		$GLOBALS["db"]->set_charset("utf8");
    }
    catch (Exception $e) {
        $GLOBALS["db"] = null;
        throw $e;
    }
}
function execute_query($query, $callback)
{
    if (!$GLOBALS["db"]) {
        throw new Exception('Database connection not opened.');
    }
    $stmt = $GLOBALS["db"]->prepare($query);
    if (!$stmt) {
        throw new Exception(sprintf('[%d] %s', $GLOBALS["db"]->errno, $GLOBALS["db"]->error));
    }
    if (method_exists('mysqli_stmt', 'get_result')) {
        if ($stmt->execute()) {
            if ($callback) {
                $rs = $stmt->get_result();
				//var_dump($rs);
                if($rs == true){
	                while ($row = $rs->fetch_assoc()) {
	                    call_user_func($callback, $row);
	                    //	var_dump($row);
	                }
        	        $rs->free();
				}
                unset($rs);
            }
        } else {
            $error = new Exception(sprintf('[%d] %s', $GLOBALS["db"]->errno, $GLOBALS["db"]->error));
        }
        $stmt->close();
        unset($stmt);
    }
}
function close_db()
{
    if (isset($GLOBALS["db"])) {
        // Kill the thread, thus closing the TCP connection
        $GLOBALS["db"]->kill($GLOBALS["db"]->thread_id);
        $GLOBALS["db"]->close();
        $GLOBALS["db"] = null;
    }
}
?>