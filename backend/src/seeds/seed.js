/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, Permission } = require('../models');
const env = require('../config/env');

const ROLES = [
  { name: 'Admin', description: 'Full portal access, all Zoho services, user/role management' },
  { name: 'HR', description: 'Access to Zoho People' },
  { name: 'Sales', description: 'Access to Zoho CRM' },
  { name: 'Support', description: 'Access to Zoho Desk' },
  { name: 'Finance', description: 'Access to Zoho Books' },
];

const PERMISSIONS = [
  { name: 'zoho.people.access', description: 'Access Zoho People module' },
  { name: 'zoho.crm.access', description: 'Access Zoho CRM module' },
  { name: 'zoho.desk.access', description: 'Access Zoho Desk module' },
  { name: 'zoho.books.access', description: 'Access Zoho Books module' },
  { name: 'admin.users.manage', description: 'Create, update, deactivate, delete users' },
  { name: 'admin.roles.manage', description: 'Create, update, delete roles' },
  { name: 'admin.permissions.manage', description: 'Create and assign permissions' },
  { name: 'admin.auditlogs.view', description: 'View audit logs' },
];

const ROLE_PERMISSION_MAP = {
  Admin: PERMISSIONS.map((p) => p.name),
  HR: ['zoho.people.access'],
  Sales: ['zoho.crm.access'],
  Support: ['zoho.desk.access'],
  Finance: ['zoho.books.access'],
};

const DEMO_USERS = [
  { name: 'Alice Admin', email: 'admin@example.com', role: 'Admin' },
  { name: 'Helen HR', email: 'hr@example.com', role: 'HR' },
  { name: 'Sam Sales', email: 'sales@example.com', role: 'Sales' },
  { name: 'Sara Support', email: 'support@example.com', role: 'Support' },
  { name: 'Frank Finance', email: 'finance@example.com', role: 'Finance' },
];

async function seed() {
  await sequelize.authenticate();
  console.log('Seeding database...');

  const roleRecords = {};
  for (const r of ROLES) {
    const [role] = await Role.findOrCreate({ where: { name: r.name }, defaults: r });
    roleRecords[r.name] = role;
  }

  const permissionRecords = {};
  for (const p of PERMISSIONS) {
    const [permission] = await Permission.findOrCreate({ where: { name: p.name }, defaults: p });
    permissionRecords[p.name] = permission;
  }

  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = roleRecords[roleName];
    const permissions = permissionNames.map((n) => permissionRecords[n]);
    await role.setPermissions(permissions);
  }

  const passwordHash = await bcrypt.hash(env.demoPassword, 12);

  for (const u of DEMO_USERS) {
    const [user] = await User.findOrCreate({
      where: { email: u.email },
      defaults: { name: u.name, email: u.email, passwordHash, isActive: true },
    });
    await user.setRoles([roleRecords[u.role]]);
  }

  console.log('Seed complete.');
  console.log('Demo users (password for all: "%s"):', env.demoPassword);
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(8)} -> ${u.email}`));
  console.log('IMPORTANT: these are development/demo credentials only. Change or remove them before production.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
