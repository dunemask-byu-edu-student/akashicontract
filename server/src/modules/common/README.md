# Common Modules

These modules are NOT designed to have controllers!
If you must have a controller, please create another service that imports the service, and add it to another module.

## Design

Common modules follow the barrel file approach where all of the files from the folder are added to an index.ts that can then be imported elsewhere.
This allows for type aliases to be clean and imports to be simple.
