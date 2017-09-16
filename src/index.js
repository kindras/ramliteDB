/**
 * Main node module
 */
var pfsLib = require('../lib/promises').file;

module.exports = function(conf) {
	var _conf = {
		user: conf || {},
		state: {
			// Is DB loaded
			loaded: false,
			// Is there data to backup
			dataToBackup: false,
			interval: null
		},
		events: {
			loaded: []
		},
		database: {}
	};

	// Load default conf
	_conf.user.log = _conf.user.log || console.log;
	_conf.user.backupFile = _conf.user.backupFile || '../backup/default.json';
	_conf.user.backupOnSet = _conf.user.backupOnSet || true;
	_conf.user.backupInterval = _conf.user.backupInterval || null;

	// Load DB (backup file)
	function _load() {
		pfsLib.exists(_conf.user.backupFile).then(() => {
			return true;
		}).catch(() => {
			return pfsLib.write(_conf.user.backupFile, "{}");
		}).then(() => {
			return pfsLib.readFile(_conf.user.backupFile);
		}).then((data) => {
			try {
				_conf.database = JSON.parse(data);
				_conf.state.loaded = true;
			}
			catch (e) {
				_conf.user.log('Error : Ill-formed backup file');
			}
		}).catch(() => {
			_conf.user.log('Error : Unable to read / write the backup file');
		});
	}

	// Save Backup file
	function _backup() {
		if (!_conf.state.dataToBackup) {
			return;
		}

		pfsLib.write(_conf.user.backupFile, _conf.database).then(() => {
			_conf.state.dataToBackup = false;
		}).catch(() => {
			_conf.user.log('Warning : Unable to save the backup file');
		});
	}

	// Check if the DB is ready (and log)
	function _checkDbReady() {
		if (!_conf.state.loaded) {
			_conf.user.log('Warning : trying to access/modify the DB while it is not loaded !!!');
		}

		return true;
	}

	// raise an event
	function _raise(event) {
		_conf.events[event].forEach((callback) => {
			callback.call();
		});
	}

	/**
	 * Attach an action to a specific event
	 *
	 * @param  {str}      event    Event Name
	 * @param  {Function} callback Action to attach
	 */
	this.on(event, callback) {
		_conf.events[event].push(callback);
	}

	/**
	 * Set a value
	 *
	 * @param  {str}    key   Key Path to the data (dot separated)
	 * @param  {mixed}  value The value to record
	 * @return {bool}         is that a success ?
	 */
	this.set = (key, value) => {
		// Checks
		_checkDbReady();

		// Set in Ram
		var path = _conf.database;
		key.split('.').forEach((node, depth) => {
			if (!path[node]) {
				path[node] = {};
			}

			if (depth === (key.length-1)) {
				path[node] = value;
			} else {
				path = path[node];
			}
		})

		// Backup
		_conf.state.dataToBackup = true;
		if (_conf.state.backupOnSet) {
			setTimeout(_backup, 1);
		}

		return true;
	}


	/**
	 * Get a value.
	 *
	 * @param  {str} key Path to the data (dot separated)
	 * @return {mixed}   null/data
	 */
	this.get = (key) => {
		// Checks
		_checkDbReady();

		// get in Ram
		var path = _conf.database;
		key.split('.').forEach((node) => {
			if (!path[node]) {
				return null;
			}

			path = path[node];
		})

		return path;
	}

	/**
	 * Free all ressources
	 */
	this.destroy() {
		clearInterval(_conf.state.interval);
	}

	if (_conf.user.backupInterval)
		_conf.state.interval = setInterval(_backup, _conf.user.backupInterval);

	_load();
};
