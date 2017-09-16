/**
 * Contains a set of generic promises
 *
 * Specific promises must be created somewhere else
 */
var fs = require('fs');
var exec = require('child_process').exec;

var promises = {
	// Execute shell command
	system: (command) => {
		return new Promise((resolve, reject) => {
			exec(command, (error, stdout, stderr) => {
				if( error !== null && !error.killed) {// error
					reject({
						error: error,
						stdout: stdout,
						stderr: stderr
					})
				} else {
					resolve(stdout);
				}
			});
		});
	},

	// Regroups all file manipulation promises
	file: {
		// List files from a folder
		list: (path) => {
			return new Promise((resolve, reject) => {
				fs.readdir(path, (err, files) => {
					if (err) {
						reject(err);
					} else {
						resolve(files);
					}
				})
			})
		},

		// Check if file/folder exists
		exists: (path) => {
			return new Promise((resolve, reject) => {
				fs.access(path, fs.F_OK, (err) => {
					if (err) {// error -> file does not exists
						// console.log(path, err);
						reject(err);
					} else {
						resolve();
					}
				});
			});
		},

		// Read data from a file
		read: (path) => {
			return new Promise((resolve, reject) => {
				fs.readFile(path, 'utf8', (err, data) => {
					if( err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		},

		// Write data into a file
		write: (path, data) => {
			return new Promise((resolve, reject) => {
				fs.writeFile(path, data, (err) => {
					if( err) {
						reject(err);
					} else {
						resolve();
					}
				})
			});
		},

		// Append data into a file
		append: (path, data) => {
			return new Promise((resolve, reject) => {
				fs.appendFile(path, data, (err) => {
					if( err) {
						reject(err);
					} else {
						resolve();
					}
				})
			});
		},

		// delete a file
		delete: (path) => {
			return new Promise((resolve, reject) => {
				promises.file.exists(folderPath).then( // Check if file exists
					() => {
						fs.unlink(path, (err) => {
							if( err) {
								reject(err);
							} else {
								resolve();
							}
						})
					},
					() => {resolve()} // no need to unlink it
				)
			});
		},

		// Get statistics about a file/folder
		stats: (path) => {
			return new Promise((resolve, reject) => {
				fs.stat(path, (err, stats) => {
					if( err) {
						reject(err);
					} else {
						resolve(stats);
					}
				});
			});
		},

		// Create a directory with 777 permissions (if not existing yet)
		mkdir: (folderPath) => {
			return new Promise((resolve, reject) => {
				promises.file.exists(folderPath).then( // Check if folder exists
					() => {resolve()}, // no need to create one
					() => {
						fs.mkdir(folderPath, 0o777, (err) => {
							if( err) {
								reject(err);
							} else {
								resolve();
							}
						})
					}
				)
			});
		}
	}
}

module.exports = promises;
