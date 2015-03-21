<?php
/**
	* Document the class downloader.
	* @package Downloader
*/
class Downloader {

	private $_conf;

	/**
		* Downloader's constructor.
		* @param configuration list files.
	*/	
	public function __construct($conf) {
		$this->_conf = $conf;
	}
	
	/*
		* Function for run server app.
	*/
	public function run() {
		header("Content-Type: text/plain");
		if(is_array($this->_conf)) {
			$this->manageRequest();
		} else {
			print("-1");
		}
	}

	/*
		* Function for get path to file.
	*/
	private function getFilePath() {
		$filename = '';
		foreach ($this->_conf as $alias => $file) {
			if ($alias === $_GET["file"]) {
				$filename = $file;
				break;
			}
		}
		return $filename;
	}
	
	/*
		* Function for print file's size in web page.
	*/
	private function infoFile() {
		$filename = $this->getFilePath();
		if(file_exists($filename)) {
			print(filesize($filename));
		} else {
			print("-1");
		}
	}

	/*
		* Function for download file by parts.
	*/
	private function getDatas() {
		$filename = $this->getFilePath();
		$position = intval($_GET["index"]);
		$blockSize = intval($_GET["size"]);
		if(file_exists($filename)) {
			if($position < filesize($filename)) {
				if($blockSize > -1) {
					//Read file.
					$fp = fopen("$filename","r");
					fseek($fp, $position);
					//Print data in base 64.
					print base64_encode(fread($fp, $blockSize));
					fclose($fp);
				} else {
					print("-1");
				}
			} else {
				print("-1");
			}
		} else {
			print("-1");
		}
	}
	
	/*
		* Function for run action.
	*/
	private function manageRequest() {
		if(isset($_GET["type"])) {
			switch($_GET["type"]) {
				case 'size':
					if(isset($_GET["file"])) {
						$this->infoFile();
					} else {
						print "-1";
					}
					break;
				case 'download':
					if(isset($_GET["file"]) && isset($_GET["size"]) && isset($_GET["index"])) {
						$this->getDatas();
					} else {
						print("-1");
					}
					break;
				default:
					print("-1");
			}
		}
	}

}
?>
