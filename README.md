# ramliteDB
NoSQL Database for node.js with all data loaded in ram and backup in json file.

## Principles
- ramliteDB doesn't need huge configurations or annything else. You won't have to setup a DB server.
- ramliteDB is intended for small projects
- The backup process of ramliteDB is detached from the writing process (for more efficiency). But this mean that if your application crash, some of the data may have not been saved in file.

## Why would you use it ?
- No configuration
- No server
- Fast (ram)
- (REALLY) Easy to learn
- JSON optimised

## Examples
Here is a list of way to set and get the data

```javascript
// Load the library
var RamliteDB = require('ramlitedb');

// instanciate the database
var rlDB = new RamliteDB({
	backupFile: './dataBase.json'
});

// wait for database to be loaded
rlDB.on('load', () => {
	// set an numerical value
	rlDB.set('version', 1.5);
	rlDB.get('version'); // (numeric) 1.5

	// set a string value
	rlDB.set('cake.name', 'Chocolator');
	rlDB.get('cake.name'); // (string) "Chocolator"

	rlDB.set('cake.sugar', '10 kg');
	console.log(rlDB.get('cake.sugar')); // (string) "10 kg"

	// set a boolean value
	rlDB.set('cake.good', true);
	console.log(rlDB.get('cake.good')); // (bool) true

	// set an array
	rlDB.set('cake.ingredients', [
		"egg",
		"sugar",
		"chocolate",
		"floor"
	]);
	console.log(rlDB.get('cake.ingredients')); // (array) [egg, ...]

	// get a specific element from an array
	console.log(rlDB.get('cake.ingredients.2')); // (string) "chocolate"

	// set an object
	rlDB.set('cake.description', {
		title: "my cake",
		author: "me the cooker"
	});
	console.log(rlDB.get('cake.description')); // (object) {title: ...}

	// get element inside and object
	console.log(rlDB.get('cake.description.title')); // (string) "my cake"

	// get element anywhere in the database
	console.log(rlDB.get('cake')); // (object) {"version":1.5, ...}
})
```

In the end you should have dataBase.json like this
```json
{
	"version": 1.5,
	"cake": {
		"name": "Chocolator",
		"sugar": "10 kg",
		"good": true,
		"ingredients": [
			"egg",
			"sugar",
			"chocolate",
			"floor"
		],
		"description": {
			"title": "my cake",
			"author": "me the cooker"
		}
	}
}
```

## Have fun folks ;)
and give me feedback
