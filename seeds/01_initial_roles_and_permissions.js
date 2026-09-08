const bcrypt = require("bcryptjs");
const { ROLES, PERMISSIONS } = require("../constants/roles");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // 1. Clear existing relations safely (preserving constraints order)
  await knex("subscription_transactions").del();
  await knex("subscriptions").del();
  await knex("plans").del();
  await knex("organization_members").del();
  await knex("organizations").del();
  await knex("role_permissions").del();
  await knex("user_roles").del();
  await knex("permissions").del();
  await knex("roles").del();

  // 2. Insert System Roles
  await knex("roles").insert([
    { id: 1, name: ROLES.ADMIN, description: "Full organization administrator access", is_system_role: true },
    { id: 2, name: ROLES.ACCOUNTANT, description: "Manage invoices, payments, taxes, and clients", is_system_role: true },
    { id: 3, name: ROLES.STAFF, description: "Create invoices and view basic data", is_system_role: true },
  ]);

  // 3. Insert Permissions
  const permissionsList = [
    // Users
    { name: PERMISSIONS.USER_VIEW, module: "users", action: "view", description: "View users list and details" },
    { name: PERMISSIONS.USER_CREATE, module: "users", action: "create", description: "Create new users" },
    { name: PERMISSIONS.USER_UPDATE, module: "users", action: "update", description: "Update user information" },
    { name: PERMISSIONS.USER_DELETE, module: "users", action: "delete", description: "Delete or deactivate users" },

    // Roles & Permissions
    { name: PERMISSIONS.ROLE_VIEW, module: "roles", action: "view", description: "View roles and permissions" },
    { name: PERMISSIONS.ROLE_MANAGE, module: "roles", action: "manage", description: "Manage roles and assign permissions" },

    // Clients
    { name: PERMISSIONS.CLIENT_VIEW, module: "clients", action: "view", description: "View clients and addresses" },
    { name: PERMISSIONS.CLIENT_CREATE, module: "clients", action: "create", description: "Create new clients" },
    { name: PERMISSIONS.CLIENT_UPDATE, module: "clients", action: "update", description: "Update clients" },
    { name: PERMISSIONS.CLIENT_DELETE, module: "clients", action: "delete", description: "Delete clients" },

    // Products & Inventory
    { name: PERMISSIONS.PRODUCT_VIEW, module: "products", action: "view", description: "View products and categories" },
    { name: PERMISSIONS.PRODUCT_CREATE, module: "products", action: "create", description: "Create products and categories" },
    { name: PERMISSIONS.PRODUCT_UPDATE, module: "products", action: "update", description: "Update products and categories" },
    { name: PERMISSIONS.PRODUCT_DELETE, module: "products", action: "delete", description: "Delete products" },
    { name: PERMISSIONS.INVENTORY_MANAGE, module: "products", action: "inventory", description: "Manage stock inventory" },

    // Invoices
    { name: PERMISSIONS.INVOICE_VIEW, module: "invoices", action: "view", description: "View invoices and details" },
    { name: PERMISSIONS.INVOICE_CREATE, module: "invoices", action: "create", description: "Create invoices" },
    { name: PERMISSIONS.INVOICE_UPDATE, module: "invoices", action: "update", description: "Update draft invoices" },
    { name: PERMISSIONS.INVOICE_DELETE, module: "invoices", action: "delete", description: "Delete/cancel invoices" },
    { name: PERMISSIONS.INVOICE_STATUS_CHANGE, module: "invoices", action: "status", description: "Change invoice status" },

    // Payments
    { name: PERMISSIONS.PAYMENT_VIEW, module: "payments", action: "view", description: "View payments" },
    { name: PERMISSIONS.PAYMENT_CREATE, module: "payments", action: "create", description: "Record new payments" },
    { name: PERMISSIONS.PAYMENT_REFUND, module: "payments", action: "refund", description: "Process payment refunds" },

    // Taxes & Discounts
    { name: PERMISSIONS.TAX_MANAGE, module: "taxes", action: "manage", description: "Manage tax rates" },
    { name: PERMISSIONS.DISCOUNT_MANAGE, module: "discounts", action: "manage", description: "Manage discounts" },

    // Reports & Dashboard
    { name: PERMISSIONS.DASHBOARD_VIEW, module: "reports", action: "dashboard", description: "View dashboard KPIs" },
    { name: PERMISSIONS.REPORT_VIEW, module: "reports", action: "view", description: "View financial reports" },
    { name: PERMISSIONS.AUDIT_VIEW, module: "audit", action: "view", description: "View system audit logs" },
  ];

  await knex("permissions").insert(permissionsList);

  // 4. Map Permissions to Roles
  const allPermissions = await knex("permissions").select("id", "name");
  const permMap = allPermissions.reduce((acc, p) => {
    acc[p.name] = p.id;
    return acc;
  }, {});

  const adminRoleMappings = allPermissions.map((p) => ({
    role_id: 1,
    permission_id: p.id,
  }));

  const accountantPermNames = [
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_STATUS_CHANGE,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.TAX_MANAGE,
    PERMISSIONS.DISCOUNT_MANAGE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ];
  const accountantRoleMappings = accountantPermNames
    .filter((name) => permMap[name])
    .map((name) => ({
      role_id: 2,
      permission_id: permMap[name],
    }));

  const staffPermNames = [
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
  ];
  const staffRoleMappings = staffPermNames
    .filter((name) => permMap[name])
    .map((name) => ({
      role_id: 3,
      permission_id: permMap[name],
    }));

  await knex("role_permissions").insert([
    ...adminRoleMappings,
    ...accountantRoleMappings,
    ...staffRoleMappings,
  ]);

  // 5. Insert SaaS Pricing Plans
  await knex("plans").insert([
    {
      id: 1,
      name: "Starter / Trial",
      code: "starter",
      description: "For small businesses & freelancers",
      price: 0.00,
      billing_interval: "monthly",
      max_users: 3,
      max_clients: 50,
      max_products: 100,
      max_invoices: 100,
      status: "active",
    },
    {
      id: 2,
      name: "Professional",
      code: "pro",
      description: "For growing teams and businesses",
      price: 999.00,
      billing_interval: "monthly",
      max_users: 10,
      max_clients: 500,
      max_products: 1000,
      max_invoices: 1000,
      status: "active",
    },
    {
      id: 3,
      name: "Enterprise",
      code: "enterprise",
      description: "Unlimited scale and features",
      price: 2999.00,
      billing_interval: "monthly",
      max_users: 100,
      max_clients: null,
      max_products: null,
      max_invoices: null,
      status: "active",
    },
  ]);

  // 6. Create Default Admin User
  let adminUser = await knex("users").where({ email: "admin@saas.com" }).first();
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash("Admin@123", salt);

    const [adminUserId] = await knex("users").insert({
      name: "Super Admin",
      email: "admin@saas.com",
      password_hash,
      phone: "9876543210",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    });
    adminUser = { id: adminUserId };
  }

  // 7. Create Demo Organization & Connect Admin as Member
  const [orgId] = await knex("organizations").insert({
    name: "Acme Enterprise",
    slug: "acme-enterprise",
    email: "billing@acme.com",
    phone: "9876543210",
    status: "active",
    timezone: "Asia/Kolkata",
    currency: "INR",
    created_at: new Date(),
    updated_at: new Date(),
  });

  await knex("organization_members").insert({
    organization_id: orgId,
    user_id: adminUser.id,
    role_id: 1, // Admin role
    status: "active",
    joined_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Assign Starter Plan Subscription to Demo Org
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);

  await knex("subscriptions").insert({
    organization_id: orgId,
    plan_id: 1,
    status: "active",
    starts_at: new Date(),
    trial_ends_at: trialEndDate,
    created_at: new Date(),
    updated_at: new Date(),
  });
};
