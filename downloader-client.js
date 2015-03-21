
/*
	* Client class for download.
	*
	* @param {String} url to downloader page.
	* @param {String} alias for download file.
*/

var Downloader = function(url, alias) {

	/*
		* Function for get xhr object.
		*
	*/

	var getXMLHttpRequest = function() {
		var xhr = null;
		if (window.XMLHttpRequest || window.ActiveXObject) {
			if (window.ActiveXObject) {
				try {
					xhr = new ActiveXObject('Msxml2.XMLHTTP');
				} catch (e) {
					xhr = new ActiveXObject('Microsoft.XMLHTTP');
				}
			} else {
				xhr = new XMLHttpRequest();
			}
		} else {
			return null;
		}

		return xhr;
	};

	var _ajax = getXMLHttpRequest();
	var _size = -1;
	var _pause = false;
	var _byteDownloaded = 0;
	var _aborted = false;
	//backup depht of recursivity for pause
	var _depth = 0;
	var _onProgress = null;
	var _onFinish = null;
	var _onError = null;
	//If downloading file is in progress.
	var _isRunning = false;

	var _nbParts = 1;
	var _offset = 0;
	var _sizeParts = 0;
	//Data downloading _buffer.
	var _buffer = new Array();

	/*
		* Accessor for bind callback function when download is finish.
		*
	*/

	this.onFinish = function(callback) {
		_onFinish = callback;
	};

	/*
		* Accessor for bind callback function when download is in progress.
		*
	*/

	this.onProgress = function(callback) {
		_onProgress = callback;
	};

	/*
		* Accessor for bind callback function when there is error.
		*
	*/

	this.onError = function(callback) {
		_onError = callback;
	};

	/*
		* Function for convert base64 to Uint8Array.
		*
		* @param {String} base64 string.
		* @return {Uint8Array} Uint8Array representation.
	*/

	var base64ToArrayBuffer = function(base64) {
		var binary_string = window.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		_byteDownloaded += len;
		if (typeof _onProgress == 'function') {
			_onProgress(_byteDownloaded, _size);
		}
		return bytes;
	};

	/*
		* Function send AJAX request.
		*
		* @param {Int} depth of recursivity.
	*/

	var getDatas = function(i) {
		if (!_aborted) {
			if (i != _nbParts && !_pause) {
				_ajax = getXMLHttpRequest();
				_ajax.onreadystatechange = function() {
					if (_ajax.readyState == 4 && !_aborted) {
						if (_ajax.status == 200 || _ajax.status == 0) {
							//Récupération et décodage des données en base 64.
							_buffer[i] = base64ToArrayBuffer(_ajax.responseText);
							getDatas(i + 1);
						} else {
							if (typeof _onError == 'function') {
								_onError(_ajax.status);
							}
						}
					}
				};
				_ajax.open('GET', url + '?type=download&file=' + alias + '&index=' + _offset + '&size=' + parseInt(_sizeParts - 1), true);
				_ajax.send(null);
				_offset += _sizeParts;
			} else {
				if (!_pause) {
					var blob = new Blob(_buffer);
					if (typeof _onProgress == 'function') {
						_onProgress(_size, _size);
					}
					if (typeof _onFinish == 'function') {
						_onFinish(window.URL.createObjectURL(blob));
					}
					_isRunning = false;
					_ajax = getXMLHttpRequest();
					_size = -1;
					_pause = false;
					_byteDownloaded = 0;
					//backup depht of recursivity for pause
					_depth = 0;
					//If downloading file is in progress.
					_isRunning = false;
					_nbParts = 1;
					_offset = 0;
					_sizeParts = 0;
					//Buffer de donnée qui va contenir les données téléchargées.
					_buffer = new Array();
				} else {
					_depth = i;
				}
			}
		}
	};

	/*
		* Accessor for get if the downloading is in pause status.
		*
		* @param {Bool} true/false if download is in pause.
	*/

	this.isPaused = function() {
		return _pause;
	};

	/*
		* Function for run the download of file.
		*
		* @param {Int} Size of parts in bytes.
	*/

	this.download = function(bytes) {
		_aborted = false;
		if(typeof bytes == 'undefined') {
			bytes = 500000;
		}
		if (!_isRunning) {
			_isRunning = true;
			//Get size
			if (_ajax != null) {
					_ajax.onreadystatechange = function() {
					if (_ajax.readyState == 4) {
						if(_ajax.status == 200 || _ajax.status == 0) {
							_size = parseInt(_ajax.responseText);
							_sizeParts = _size;
							for (var i = 0; i < _nbParts; ++i) {
								_buffer[i] = null;
							}
							if (_size > bytes) {
								_nbParts = parseInt(_size / bytes);
								_sizeParts = parseInt(_size / _nbParts);
								_buffer = new Array(_nbParts);
							}
							getDatas(0);
						} else {
							if (typeof _onError == 'function') {
								_onError(_ajax.status);
							}
						}
					}
				};
				_ajax.open('GET', url + '?type=size&file=' + alias, true);
				//Send request for download file.
				_ajax.send(null);
			}
		}
	};

	/*
		* Function for pause download file.
		*
	*/

	this.pause = function() {
		_pause = true;
	};

	/*
		* Function for abort download.
		*
	*/

	this.abort = function() {
		_aborted = true;
		_isRunning = false;
		_ajax = getXMLHttpRequest();
		_size = -1;
		_pause = false;
		_byteDownloaded = 0;
		_depth = 0;
		_isRunning = false;
		_nbParts = 1;
		_offset = 0;
		_sizeParts = 0;
		_buffer = new Array();
	}

	/*
		* Function for resume download file.
		*
	*/

	this.resume = function() {
		if (_pause) {
			_pause = false;
			getDatas(_depth);
		}
	};

};
