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
			load: [],
			backup: [],
			unload: []
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
		}).catch((e) => {
			_conf.user.log('Error : Unable to create the backup file :', e);
		}).then(() => {
			return pfsLib.read(_conf.user.backupFile);
		}).then((data) => {
			try {
				_conf.database = JSON.parse(data);
				_conf.state.loaded = true;

				try {
					_raise('load');
				}
				catch (e) {
					_conf.user.log('Error : A function attached to the load event failed :', e);
				}
			}
			catch (e) {
				_conf.user.log('Error : Ill-formed backup file :', e);
			}
		}).catch((e) => {
			_conf.user.log('Error : Unable to read the backup file :', e);
		});
	}

	// Save Backup file
	function _backup() {
		if (!_conf.state.dataToBackup) {
			return;
		}

		pfsLib.write(_conf.user.backupFile, JSON.stringify(_conf.database)).then(() => {
			_conf.state.dataToBackup = false;
			_raise('backup');
		}).catch(() => {
			_conf.user.log('Warning : Unable to save the backup file');
		});
	}

	// Check if the DB is ready (and log)
	function _checkDbReady() {
		if (!_conf.state.loaded) {
			_conf.user.log('Warning : trying to access/modify the DB while it is not loaded !!!');
			throw 'Database not ready';
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
	 * Security function. Inject values in the "key path", checking no "dot" are injected by values.
	 * This ensure users don't try to access/set forbiden data
	 *
	 * @param  {string} key    A classic key, with ? in place of injection spots
	 * @param  {array}  values List of values to inject
	 *
	 * @return {object}        Chaining object
	 */
	this.inject = (key, values) => {
		var parts = key.split('?');
		if (parts.length !== values.length + 1)
			throw "Error: can't match '?' and injections";

		var genKey = '';
		key.split('?').forEach((part, i) => {
			if (values[i].indexOf('.') !== -1)
				throw "Error: Forbiden injection value";

			genKey = key + (values[i] || '');
		});

		return {
			set: (value) => (this.set(genKey, value)),
			get: () => (this.get(genKey))
		};
	}

	/**
	 * Attach an action to a specific event
	 *
	 * @param  {str}      event    Event Name
	 * @param  {Function} callback Action to attach
	 */
	this.on = (event, callback) => {
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
		key = key.split('.');
		key.forEach((node, depth) => {
			if (depth === (key.length-1)) {
				path[node] = value;
			} else if (path[node] === undefined) {
				path[node] = {};
			}

			path = path[node];
		})

		// Backup
		_conf.state.dataToBackup = true;
		if (_conf.user.backupOnSet) {
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
	this.destroy = () => {
		clearInterval(_conf.state.interval);
		if (this.dataToBackup) {
			_backup();
			this.on('backup', () => {
				_raise('unload');
			})
		} else {
			_raise('unload');
		}
	}

	if (_conf.user.backupInterval)
		_conf.state.interval = setInterval(_backup, _conf.user.backupInterval);

	_load();
};
