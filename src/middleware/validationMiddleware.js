const { ApiError } = require('../utils/apiResponse');

/**
 * Generic validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register)
 *
 * On success, req.body is replaced with the parsed (and type-coerced) data.
 * On failure, forwards a 400 ApiError with a readable message so the
 * frontend can show it directly.
 */
function validate(schema, source = 'body') {
  return function validationHandler(req, res, next) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Invalid request data';
      return next(new ApiError(message, 400, 'VALIDATION_ERROR'));
    }

    req[source] = result.data;
    next();
  };
}

module.exports = validate;
