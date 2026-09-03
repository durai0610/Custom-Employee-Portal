process.env.NODE_ENV = 'test';

const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // eslint-disable-next-line global-require
  const bcrypt = require('bcryptjs');
  const { User, Role, Permission } = require('../src/models');

  const roles = {
    Admin: await Role.create({ name: 'Admin', description: 'Full access' }),
    HR: await Role.create({ name: 'HR', description: 'Zoho People' }),
    Sales: await Role.create({ name: 'Sales', description: 'Zoho CRM' }),
    Support: await Role.create({ name: 'Support', description: 'Zoho Desk' }),
    Finance: await Role.create({ name: 'Finance', description: 'Zoho Books' }),
  };

  const permission = await Permission.create({ name: 'admin.users.manage', description: 'Manage users' });
  await roles.Admin.setPermissions([permission]);

  const passwordHash = await bcrypt.hash('Passw0rd!123', 4);

  const seedUser = async (email, role, name) => {
    const user = await User.create({ name, email, passwordHash, isActive: true });
    await user.setRoles([roles[role]]);
    return user;
  };

  await seedUser('admin@example.com', 'Admin', 'Alice Admin');
  await seedUser('hr@example.com', 'HR', 'Helen HR');
  await seedUser('sales@example.com', 'Sales', 'Sam Sales');
  await seedUser('support@example.com', 'Support', 'Sara Support');
  await seedUser('finance@example.com', 'Finance', 'Frank Finance');
});

afterAll(async () => {
  await sequelize.close();
});
