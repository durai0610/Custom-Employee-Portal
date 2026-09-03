const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

const usersController = require('../controllers/admin/usersController');
const rolesController = require('../controllers/admin/rolesController');
const permissionsController = require('../controllers/admin/permissionsController');
const auditLogsController = require('../controllers/admin/auditLogsController');

const {
  createUserValidator,
  updateUserValidator,
  idParamValidator,
  createRoleValidator,
  updateRoleValidator,
  createPermissionValidator,
} = require('../validators/adminValidators');

const router = express.Router();

// Every route below requires authentication AND the Admin role.
// This is enforced here, in the backend router — not just hidden in the UI.
router.use(authenticateToken, authorizeRoles('Admin'));

// Users
router.get('/users', usersController.listUsers);
router.post('/users', createUserValidator, validate, usersController.createUser);
router.put('/users/:id', updateUserValidator, validate, usersController.updateUser);
router.delete('/users/:id', idParamValidator, validate, usersController.deleteUser);

// Roles
router.get('/roles', rolesController.listRoles);
router.post('/roles', createRoleValidator, validate, rolesController.createRole);
router.put('/roles/:id', updateRoleValidator, validate, rolesController.updateRole);
router.delete('/roles/:id', idParamValidator, validate, rolesController.deleteRole);

// Permissions
router.get('/permissions', permissionsController.listPermissions);
router.post('/permissions', createPermissionValidator, validate, permissionsController.createPermission);

// Audit logs
router.get('/audit-logs', auditLogsController.listAuditLogs);

module.exports = router;
