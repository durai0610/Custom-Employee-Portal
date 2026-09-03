const { body, param } = require('express-validator');

const createUserValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('roleIds').optional().isArray(),
  body('roleIds.*').optional().isUUID(),
];

const updateUserValidator = [
  param('id').isUUID(),
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('isActive').optional().isBoolean(),
  body('roleIds').optional().isArray(),
  body('roleIds.*').optional().isUUID(),
];

const idParamValidator = [param('id').isUUID()];

const createRoleValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 40 }),
  body('description').optional().isString().isLength({ max: 255 }),
  body('permissionIds').optional().isArray(),
  body('permissionIds.*').optional().isUUID(),
];

const updateRoleValidator = [
  param('id').isUUID(),
  body('name').optional().isString().trim().isLength({ min: 2, max: 40 }),
  body('description').optional().isString().isLength({ max: 255 }),
  body('permissionIds').optional().isArray(),
  body('permissionIds.*').optional().isUUID(),
];

const createPermissionValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }),
  body('description').optional().isString().isLength({ max: 255 }),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  idParamValidator,
  createRoleValidator,
  updateRoleValidator,
  createPermissionValidator,
};
