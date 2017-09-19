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

## Doc
### ramliteDB.set(key, value)
Set a value

- param  {str}    key   Key Path to the data (dot separated)
- param  {mixed}  value The value to record
- return {bool}         is that a success ?

### ramliteDB.get(key)
Get a value

- param  {str} key Path to the data (dot separated)
- return {mixed}   null/data

### ramliteDB.destroy()
Free all ressources (! this is asynchrone !)

### ramliteDB.inject(key, values)
Security function. Inject values in the "key path", checking no "dot" are injected by values.
This ensure users don't try to access/set forbiden data

- param  {string} key    A classic key, with ? in place of injection spots
- param  {array}  values List of values to inject
- return {object}        Chaining object

### ramliteDB.on(event, callback)
Attach an action to a specific event (load, backup, unload)

- param  {str}      event    Event Name
- param  {Function} callback Action to attach

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

## Advanced features
### Secured injection

Let's suppose the key you want to access/set depend of a value.

Here is our working database :

```json
{
	"user": {
		"Emma": {
			password: "mySecretPassword"
		},
		"Marc": {
			password: "1234"
		}
	},
}
```

Let's see what you should do :

```javascript
	// Here come the request data
	var nicePseudo = "Marc";
	var evilPseudo = "Marc.password";

	rlDB.inject("user.?.password", [nicePseudo])
		.set("the new password");

	rlDB.inject("user.?.password", [nicePseudo])
		.get(); // "the new password"

	rlDB.inject("user.?.password", [evilPseudo])
		.set("the new password"); // throw an error because of the "."

	rlDB.inject("user.?.password", [evilPseudo])
		.get(); // "the new password" // throw an error because of the "."
})
```

## Have fun folks ;)
and give me feedback
