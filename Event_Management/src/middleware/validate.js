const ApiError = require('../utils/ApiError');

/**
 * Checks req.body against a Joi schema before the controller runs.
 * Usage in a route: router.post('/register', validate(registerSchema), register)
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body || {}, {
      abortEarly: false, // report every problem at once, not just the first
      stripUnknown: true, // silently drop fields we didn't ask for
    });

    if (error) {
      // Turn Joi's detailed error into a simple list: [{ field, message }]
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return next(new ApiError(400, 'Validation failed', errors));
    }

    req.body = value; // use the cleaned-up data (trimmed, extra fields removed)
    next();
  };
}

module.exports = validate;
