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
