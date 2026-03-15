const Module = require("module");

exports.loadWithMocks = function(modulePath, mocks = {}) {
  const resolvedPath = require.resolve(modulePath);
  delete require.cache[resolvedPath];

  const originalLoad = Module._load;
  Module._load = function(request, parent, isMain) {
    if (Object.prototype.hasOwnProperty.call(mocks, request)) {
      return mocks[request];
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return require(resolvedPath);
  } finally {
    Module._load = originalLoad;
  }
};

exports.clearModule = function(modulePath) {
  delete require.cache[require.resolve(modulePath)];
};
