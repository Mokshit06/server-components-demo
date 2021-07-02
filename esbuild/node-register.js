const url = require('url');
const Module = require('module');

module.exports = function register() {
  const MODULE_REFERENCE = Symbol.for('react.module.reference');
  const proxyHandlers = {
    get(target, name, receiver) {
      switch (name) {
        case '$$typeof': {
          return target.$$typeof;
        }
        case 'filepath': {
          return target.filepath;
        }
        case 'name': {
          return target.name;
        }
        case 'defaultProps': {
          return undefined;
        }
        case '__esModule': {
          target.default = {
            $$typeof: MODULE_REFERENCE,
            filepath: target.filepath,
            name: '',
          };
          return true;
        }
      }

      let cachedReference = target[name];

      if (!cachedReference) {
        cachedReference = target[name] = {
          $$typeof: MODULE_REFERENCE,
          filepath: target.filepath,
          name,
        };
      }

      return cachedReference;
    },
    set() {
      throw new Error('Cannot assign to a client module from a server module.');
    },
  };

  require.extensions['.client.js'] = (module, path) => {
    const moduleId = url.pathToFileURL(path).href;
    const moduleReference = {
      $$typeof: MODULE_REFERENCE,
      filepath: moduleId,
      name: '*',
    };

    module.exports = new Proxy(moduleReference, proxyHandlers);
  };

  const originalResolveFilename = Module._resolveFilename;

  Module._resolveFilename = (request, parent, isMain, options) => {
    const resolved = originalResolveFilename(request, parent, isMain, options);

    if (resolved.endsWith('.server.js')) {
      if (
        parent &&
        parent.filename &&
        !parent.filename.endsWith('.server.js')
      ) {
        let reason;

        if (request.endsWith('.server.js')) {
          reason = `"${request}"`;
        } else {
          reason = `"${request}"(which expands to "${resolved}")`;
        }

        throw new Error(
          `Cannot import ${reason} from "${parent.filename}". By react-server convention, .server.js files can only be imported from other .server.js files. That way nobody accidentally sends these to the client by indirectly importing it.`
        );
      }
    }

    return resolved;
  };
};
