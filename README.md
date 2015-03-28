CollectionSpace API client
==========================

Work with the CollectionSpace backend. Priorities (CRUD):

- authorities and child records
- collectionobjects
- roles

See the related [cscli tool](https://www.github.com/mark-cooper/cscli) for a command line interface.

**Quickstart (from source)**

Install `node` and `npm` (`nvm` recommended with current `stable` i.e. `nvm use stable`). Clone and `cd` to this repository:

```
npm install
```

Should create a local `node_modules` directory.

**Tests**

```
gulp
```

**Examples**

These can be run directly:

```
node examples/purge-empty-vocabularies.js
```

**Usage**

```js
require 'csapi' # not available yet and may be refactored
var csapi = new csapi(cspace);
```

---