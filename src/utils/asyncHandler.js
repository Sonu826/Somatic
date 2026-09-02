/**
 * Wraps an async Express route/controller so thrown errors (or rejected
 * promises) are forwarded to next(), instead of every controller needing
 * its own try/catch boilerplate.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
