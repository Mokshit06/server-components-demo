import '__client_components__';

interface ModuleData {
  chunks: string[];
  id: string;
  name: string;
}

const esbuildCache = new Map();
function __esbuild_require__(moduleId: string) {
  if (!esbuildCache.has(moduleId)) {
    throw new Error(`[esbuild]: ${moduleId} not in cache`);
  }
  return esbuildCache.get(moduleId);
}

function createStringDecoder() {
  return new TextDecoder();
}
const decoderOptions = {
  stream: true,
};
function readPartialStringChunk(decoder: TextDecoder, buffer: Uint8Array) {
  return decoder.decode(buffer, decoderOptions);
}
function readFinalStringChunk(decoder: TextDecoder, buffer: Uint8Array) {
  return decoder.decode(buffer);
}

function parseModel(response: ReactResponse, json: string) {
  return JSON.parse(json, response._fromJSON);
}

// eslint-disable-next-line no-unused-vars
function resolveModuleReference(moduleData: ModuleData) {
  return moduleData;
} // The chunk cache contains all the chunks we've preloaded so far.
// If they're still pending they're a thenable. This map also exists
// in Webpack but unfortunately it's not exposed so we have to
// replicate it in user space. null means that it has already loaded.

var chunkCache = new Map(); // Start preloading the modules since we might need them soon.
// This function doesn't suspend.

function preloadModule(moduleData: ModuleData) {
  const chunks = moduleData.chunks;

  for (var i = 0; i < chunks.length; i++) {
    const chunkId = chunks[i];
    const entry = chunkCache.get(chunkId);

    if (entry === undefined) {
      const thenable = import(`/${chunkId}.js`);
      const resolve = (module: any) => {
        // esbuildCache.set(chunkId, module);
        esbuildCache.set(moduleData.id, module);
        chunkCache.set(chunkId, null);
      };
      const reject = () => {
        // esbuildCache.set(chunkId, undefined);
        esbuildCache.set(moduleData.id, undefined);
        chunkCache.set(chunkId, undefined);
      };
      thenable.then(resolve, reject);
      chunkCache.set(chunkId, thenable);
    }
  }
} // Actually require the module or suspend if it's not yet ready.
// Increase priority if necessary.

function requireModule(moduleData: ModuleData) {
  var chunks = moduleData.chunks;

  for (var i = 0; i < chunks.length; i++) {
    var chunkId = chunks[i];
    var entry = chunkCache.get(chunkId);

    if (entry !== null) {
      // We assume that preloadModule has been called before.
      // So we don't expect to see entry being undefined here, that's an error.
      // Let's throw either an error or the Promise.
      throw entry;
    }
  }

  var moduleExports = __esbuild_require__(moduleData.id);

  if (moduleData.name === '*') {
    // This is a placeholder value that represents that the caller imported this
    // as a CommonJS module as is.
    return moduleExports;
  }

  if (moduleData.name === '') {
    // This is a placeholder value that represents that the caller accessed the
    // default property of this if it was an ESM interop module.
    return moduleExports.default;
  }

  return moduleExports[moduleData.name];
}

type ReactType = number | symbol;

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
let REACT_ELEMENT_TYPE: ReactType = 0xeac7;
let REACT_PORTAL_TYPE: ReactType = 0xeaca;
let REACT_FRAGMENT_TYPE: ReactType = 0xeacb;
let REACT_STRICT_MODE_TYPE: ReactType = 0xeacc;
let REACT_PROFILER_TYPE: ReactType = 0xead2;
let REACT_PROVIDER_TYPE: ReactType = 0xeacd;
let REACT_CONTEXT_TYPE: ReactType = 0xeace;
let REACT_FORWARD_REF_TYPE: ReactType = 0xead0;
let REACT_SUSPENSE_TYPE: ReactType = 0xead1;
let REACT_SUSPENSE_LIST_TYPE: ReactType = 0xead8;
let REACT_MEMO_TYPE: ReactType = 0xead3;
let REACT_LAZY_TYPE: ReactType = 0xead4;
let REACT_SCOPE_TYPE: ReactType = 0xead7;
let REACT_OPAQUE_ID_TYPE: ReactType = 0xeae0;
let REACT_DEBUG_TRACING_MODE_TYPE: ReactType = 0xeae1;
let REACT_OFFSCREEN_TYPE: ReactType = 0xeae2;
let REACT_LEGACY_HIDDEN_TYPE: ReactType = 0xeae3;
let REACT_CACHE_TYPE: ReactType = 0xeae4;

if (typeof Symbol === 'function' && Symbol.for) {
  var symbolFor = Symbol.for;
  REACT_ELEMENT_TYPE = symbolFor('react.element');
  REACT_PORTAL_TYPE = symbolFor('react.portal');
  REACT_FRAGMENT_TYPE = symbolFor('react.fragment');
  REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
  REACT_PROFILER_TYPE = symbolFor('react.profiler');
  REACT_PROVIDER_TYPE = symbolFor('react.provider');
  REACT_CONTEXT_TYPE = symbolFor('react.context');
  REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
  REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
  REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
  REACT_MEMO_TYPE = symbolFor('react.memo');
  REACT_LAZY_TYPE = symbolFor('react.lazy');
  REACT_SCOPE_TYPE = symbolFor('react.scope');
  REACT_OPAQUE_ID_TYPE = symbolFor('react.opaque.id');
  REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
  REACT_OFFSCREEN_TYPE = symbolFor('react.offscreen');
  REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
  REACT_CACHE_TYPE = symbolFor('react.cache');
}

const PENDING = 0;
const RESOLVED_MODEL = 1;
const RESOLVED_MODULE = 2;
const INITIALIZED = 3;
const ERRORED = 4;

class Chunk {
  _status: number;
  _value: any;
  _response: ReactResponse;

  constructor(status: number, value: any, response: ReactResponse) {
    this._status = status;
    this._value = value;
    this._response = response;
  }

  then(resolve: any) {
    const chunk = this;
    if (chunk._status === PENDING) {
      if (chunk._value === null) {
        chunk._value = [];
      }

      chunk._value.push(resolve);
    } else {
      resolve();
    }
  }
}

function readChunk(chunk: Chunk) {
  switch (chunk._status) {
    case INITIALIZED:
      return chunk._value;

    case RESOLVED_MODEL:
      return initializeModelChunk(chunk);

    case RESOLVED_MODULE:
      return initializeModuleChunk(chunk);

    case PENDING:
      // eslint-disable-next-line no-throw-literal
      throw chunk;

    default:
      throw chunk._value;
  }
}

function readRoot() {
  var response = this;
  var chunk = getChunk(response, 0);
  return readChunk(chunk);
}

function createPendingChunk(response: ReactResponse) {
  return new Chunk(PENDING, null, response);
}

function createErrorChunk(response: ReactResponse, error) {
  return new Chunk(ERRORED, error, response);
}

function createInitializedChunk(response: ReactResponse, value) {
  return new Chunk(INITIALIZED, value, response);
}

function wakeChunk(listeners) {
  if (listeners !== null) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }
  }
}

function triggerErrorOnChunk(chunk: Chunk, error) {
  if (chunk._status !== PENDING) {
    // We already resolved. We didn't expect to see this.
    return;
  }

  var listeners = chunk._value;
  var erroredChunk = chunk;
  erroredChunk._status = ERRORED;
  erroredChunk._value = error;
  wakeChunk(listeners);
}

function createResolvedModelChunk(response, value) {
  return new Chunk(RESOLVED_MODEL, value, response);
}

function createResolvedModuleChunk(response, value) {
  return new Chunk(RESOLVED_MODULE, value, response);
}

function resolveModelChunk(chunk: Chunk, value) {
  if (chunk._status !== PENDING) {
    // We already resolved. We didn't expect to see this.
    return;
  }

  var listeners = chunk._value;
  var resolvedChunk = chunk;
  resolvedChunk._status = RESOLVED_MODEL;
  resolvedChunk._value = value;
  wakeChunk(listeners);
}

function resolveModuleChunk(chunk: Chunk, value) {
  if (chunk._status !== PENDING) {
    // We already resolved. We didn't expect to see this.
    return;
  }

  var listeners = chunk._value;
  var resolvedChunk = chunk;
  resolvedChunk._status = RESOLVED_MODULE;
  resolvedChunk._value = value;
  wakeChunk(listeners);
}

function initializeModelChunk(chunk: Chunk) {
  var value = parseModel(chunk._response, chunk._value);

  // const initializedChunk = chunk;
  chunk._status = INITIALIZED;
  chunk._value = value;

  return value;
}

function initializeModuleChunk(chunk: Chunk) {
  var value = requireModule(chunk._value);

  // const initializedChunk = chunk;
  chunk._status = INITIALIZED;
  chunk._value = value;

  return value;
} // Report that any missing chunks in the model is now going to throw this
// error upon read. Also notify any pending promises.

function reportGlobalError(response, error) {
  response._chunks.forEach((chunk: Chunk) => {
    // If this chunk was already resolved or errored, it won't
    // trigger an error but if it wasn't then we need to
    // because we won't be getting any new data to resolve it.
    triggerErrorOnChunk(chunk, error);
  });
}

function createElement(type: React.ComponentType, key: any, props: any) {
  var element: any = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,
    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: null,
    props: props,
    // Record the component responsible for creating this element.
    _owner: null,
  };

  {
    // We don't really need to add any of these but keeping them for good measure.
    // Unfortunately, _store is enumerable in jest matchers so for equality to
    // work, I need to keep it or make _store non-enumerable in the other file.
    element._store = {};
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: true, // This element has already been validated on the server.
    });
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: null,
    });
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: null,
    });
  }

  return element;
}

function createLazyChunkWrapper(chunk: Chunk) {
  var lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: chunk,
    _init: readChunk,
  };
  return lazyType;
}

function getChunk(response: ReactResponse, id: number) {
  var chunks = response._chunks;
  var chunk = chunks.get(id);

  if (!chunk) {
    chunk = createPendingChunk(response);
    chunks.set(id, chunk);
  }

  return chunk;
}

function parseModelString(response: ReactResponse, parentObject, value) {
  switch (value[0]) {
    case '$': {
      if (value === '$') {
        return REACT_ELEMENT_TYPE;
      } else if (value[1] === '$' || value[1] === '@') {
        // This was an escaped string value.
        return value.substring(1);
      } else {
        var id = parseInt(value.substring(1), 16);
        var chunk = getChunk(response, id);
        return readChunk(chunk);
      }
    }

    case '@': {
      var _id = parseInt(value.substring(1), 16);

      var _chunk = getChunk(response, _id); // We create a React.lazy wrapper around any lazy values.
      // When passed into React, we'll know how to suspend on this.

      return createLazyChunkWrapper(_chunk);
    }
  }

  return value;
}
function parseModelTuple(respons: ReactResponse, value) {
  var tuple = value;

  if (tuple[0] === REACT_ELEMENT_TYPE) {
    // TODO: Consider having React just directly accept these arrays as elements.
    // Or even change the ReactElement type to be an array.
    const element = createElement(tuple[1], tuple[2], tuple[3]);
    return element;
  }

  return value;
}

interface ReactResponse {
  _chunks: Map<number, Chunk>;
  readRoot: any;
  _partialRow: string;
  _stringDecoder: TextDecoder;
  _fromJSON: (key: string, value: any) => any;
}

function createResponse() {
  const chunks = new Map();
  const response = {
    _chunks: chunks,
    readRoot,
  };

  return response as ReactResponse;
}

function resolveModel(response: ReactResponse, id: number, model) {
  var chunks = response._chunks;
  var chunk = chunks.get(id);

  if (!chunk) {
    chunks.set(id, createResolvedModelChunk(response, model));
  } else {
    resolveModelChunk(chunk, model);
  }
}
function resolveModule(response: ReactResponse, id: number, model) {
  var chunks = response._chunks;
  var chunk = chunks.get(id);
  var moduleMetaData = parseModel(response, model);
  var moduleReference = resolveModuleReference(moduleMetaData); // TODO: Add an option to encode modules that are lazy loaded.
  // For now we preload all modules as early as possible since it's likely
  // that we'll need them.

  preloadModule(moduleReference);

  if (!chunk) {
    chunks.set(id, createResolvedModuleChunk(response, moduleReference));
  } else {
    resolveModuleChunk(chunk, moduleReference);
  }
}
function resolveSymbol(response: ReactResponse, id: number, name) {
  var chunks = response._chunks; // We assume that we'll always emit the symbol before anything references it
  // to save a few bytes.

  chunks.set(id, createInitializedChunk(response, Symbol.for(name)));
}
function resolveError(
  response: ReactResponse,
  id: number,
  message: string,
  stack: string
) {
  var error = new Error(message);
  error.stack = stack;
  var chunks = response._chunks;
  var chunk = chunks.get(id);

  if (!chunk) {
    chunks.set(id, createErrorChunk(response, error));
  } else {
    triggerErrorOnChunk(chunk, error);
  }
}
function close(response: ReactResponse) {
  // In case there are any remaining unresolved chunks, they won't
  // be resolved now. So we need to issue an error to those.
  // Ideally we should be able to early bail out if we kept a
  // ref count of pending chunks.
  reportGlobalError(response, new Error('Connection closed.'));
}

function processFullRow(response: ReactResponse, row: string) {
  if (row === '') {
    return;
  }

  var tag = row[0]; // When tags that are not text are added, check them here before
  // parsing the row as text.
  // switch (tag) {
  // }

  var colon = row.indexOf(':', 1);
  var id = parseInt(row.substring(1, colon), 16);
  var text = row.substring(colon + 1);

  switch (tag) {
    case 'J': {
      resolveModel(response, id, text);
      return;
    }

    case 'M': {
      resolveModule(response, id, text);
      return;
    }

    case 'S': {
      resolveSymbol(response, id, JSON.parse(text));
      return;
    }

    case 'E': {
      var errorInfo = JSON.parse(text);
      resolveError(response, id, errorInfo.message, errorInfo.stack);
      return;
    }

    default: {
      throw new Error(
        "Error parsing the data. It's probably an error code or network corruption."
      );
    }
  }
}

function processStringChunk(response: ReactResponse, chunk: string, offset) {
  var linebreak = chunk.indexOf('\n', offset);

  while (linebreak > -1) {
    var fullrow = response._partialRow + chunk.substring(offset, linebreak);
    processFullRow(response, fullrow);
    response._partialRow = '';
    offset = linebreak + 1;
    linebreak = chunk.indexOf('\n', offset);
  }

  response._partialRow += chunk.substring(offset);
}
function processBinaryChunk(response: ReactResponse, chunk: Uint8Array) {
  var stringDecoder = response._stringDecoder;
  var linebreak = chunk.indexOf(10); // newline

  while (linebreak > -1) {
    var fullrow =
      response._partialRow +
      readFinalStringChunk(stringDecoder, chunk.subarray(0, linebreak));
    processFullRow(response, fullrow);
    response._partialRow = '';
    chunk = chunk.subarray(linebreak + 1);
    linebreak = chunk.indexOf(10); // newline
  }

  response._partialRow += readPartialStringChunk(stringDecoder, chunk);
}

function createFromJSONCallback(response: ReactResponse) {
  return (key: string, value: any) => {
    if (typeof value === 'string') {
      // We can't use .bind here because we need the "this" value.
      return parseModelString(response, this, value);
    }

    if (typeof value === 'object' && value !== null) {
      return parseModelTuple(response, value);
    }

    return value;
  };
}

function createResponse$1() {
  // NOTE: CHECK THE COMPILER OUTPUT EACH TIME YOU CHANGE THIS.
  // It should be inlined to one object literal but minor changes can break it.
  const stringDecoder = createStringDecoder();
  const response = createResponse();
  response._partialRow = '';

  {
    response._stringDecoder = stringDecoder;
  } // Don't inline this call because it causes closure to outline the call above.

  response._fromJSON = createFromJSONCallback(response);
  return response;
}

function startReadingFromStream(
  response: ReactResponse,
  stream: ReadableStream<Uint8Array>
) {
  var reader = stream.getReader();

  function progress(_ref: ReadableStreamDefaultReadResult<Uint8Array>) {
    var done = _ref.done,
      value = _ref.value;

    if (done) {
      close(response);
      return;
    }

    var buffer = value;
    processBinaryChunk(response, buffer);
    return reader.read().then(progress, error);
  }

  function error(e: any) {
    reportGlobalError(response, e);
  }

  reader.read().then(progress, error);
}

export function createFromReadableStream(stream: ReadableStream<Uint8Array>) {
  var response = createResponse$1();
  startReadingFromStream(response, stream);
  return response;
}

export function createFromFetch(promiseForResponse: Promise<Response>) {
  var response = createResponse$1();
  promiseForResponse.then(
    (r) => {
      startReadingFromStream(response, r.body);
    },
    (e) => {
      reportGlobalError(response, e);
    }
  );
  return response;
}

export function createFromXHR(request: any) {
  var response = createResponse$1();
  var processedLength = 0;

  function progress(e) {
    var chunk = request.responseText;
    processStringChunk(response, chunk, processedLength);
    processedLength = chunk.length;
  }

  function load(e) {
    progress(e);
    close(response);
  }

  function error(e) {
    reportGlobalError(response, new TypeError('Network error'));
  }

  request.addEventListener('progress', progress);
  request.addEventListener('load', load);
  request.addEventListener('error', error);
  request.addEventListener('abort', error);
  request.addEventListener('timeout', error);
  return response;
}
