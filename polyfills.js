// Minimal polyfills loaded before app startup

// queueMicrotask polyfill: ensure global availability for bundles expecting it
if (typeof global.queueMicrotask !== "function") {
  // Prefer native Promise microtask when available
  global.queueMicrotask = function queueMicrotaskPolyfill(callback) {
    if (typeof Promise === "function") {
      Promise.resolve()
        .then(callback)
        .catch(function handleQueueMicrotaskError(err) {
          // Re-throw asynchronously to avoid swallowing errors
          setTimeout(function throwAsync() {
            throw err;
          }, 0);
        });
      return;
    }

    // Fallback to setImmediate if present, else setTimeout 0
    if (typeof setImmediate === "function") {
      setImmediate(callback);
      return;
    }

    setTimeout(callback, 0);
  };
}
