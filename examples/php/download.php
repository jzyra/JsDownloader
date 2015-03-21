<?php
require("downloader.php");

$dl = new Downloader(array(
	"test" => "./test",
));
$dl->run();

?>
