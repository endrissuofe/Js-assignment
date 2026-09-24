const Joi = require('joi');

// Password rule: at least 8 characters, with at least one letter and one number.
const passwordRule = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one letter and one number',
  });

// Rules for POST /api/auth/register
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: passwordRule,
});

// Rules for POST /api/auth/login
// We don't re-check password strength here, only that something was sent.
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
