/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. Add is_system_role to roles table
  const hasIsSystemRole = await knex.schema.hasColumn('roles', 'is_system_role');
  if (!hasIsSystemRole) {
    await knex.schema.table('roles', (table) => {
      table.boolean('is_system_role').notNullable().defaultTo(false);
    });
  }

  // 2. Add organization_id to clients
  await knex.schema.table('clients', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
  });

  // 3. Add organization_id to product_categories + composite unique
  await knex.schema.table('product_categories', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
    table.dropUnique(['name']);
    table.unique(['organization_id', 'name'], 'uq_org_category_name');
  });

  // 4. Add organization_id to products + composite unique
  await knex.schema.table('products', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
    table.dropUnique(['sku']);
    table.unique(['organization_id', 'sku'], 'uq_org_product_sku');
  });

  // 5. Add organization_id to invoices + composite unique
  await knex.schema.table('invoices', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
    table.dropUnique(['invoice_number']);
    table.unique(['organization_id', 'invoice_number'], 'uq_org_invoice_number');
  });

  // 6. Add organization_id to payments
  await knex.schema.table('payments', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
  });

  // 7. Add organization_id to taxes + composite unique
  await knex.schema.table('taxes', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
    table.dropUnique(['code']);
    table.unique(['organization_id', 'code'], 'uq_org_tax_code');
  });

  // 8. Add organization_id to discounts
  await knex.schema.table('discounts', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
  });

  // 9. Add organization_id to audit_logs
  await knex.schema.table('audit_logs', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
  });

  // 10. Add organization_id to notifications
  await knex.schema.table('notifications', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
  });

  // 11. Add organization_id to files
  await knex.schema.table('files', (table) => {
    table.bigInteger('organization_id').unsigned().nullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Rollback column changes
  await knex.schema.table('files', (table) => { table.dropColumn('organization_id'); });
  await knex.schema.table('notifications', (table) => { table.dropColumn('organization_id'); });
  await knex.schema.table('audit_logs', (table) => { table.dropColumn('organization_id'); });
  await knex.schema.table('discounts', (table) => { table.dropColumn('organization_id'); });
  await knex.schema.table('taxes', (table) => {
    table.dropForeign('organization_id');
    table.dropUnique(['organization_id', 'code'], 'uq_org_tax_code');
    table.dropColumn('organization_id');
    table.unique(['code']);
  });
  await knex.schema.table('payments', (table) => { table.dropColumn('organization_id'); });
  await knex.schema.table('invoices', (table) => {
    table.dropForeign('organization_id');
    table.dropUnique(['organization_id', 'invoice_number'], 'uq_org_invoice_number');
    table.dropColumn('organization_id');
    table.unique(['invoice_number']);
  });
  await knex.schema.table('products', (table) => {
    table.dropForeign('organization_id');
    table.dropUnique(['organization_id', 'sku'], 'uq_org_product_sku');
    table.dropColumn('organization_id');
    table.unique(['sku']);
  });
  await knex.schema.table('product_categories', (table) => {
    table.dropForeign('organization_id');
    table.dropUnique(['organization_id', 'name'], 'uq_org_category_name');
    table.dropColumn('organization_id');
    table.unique(['name']);
  });
  await knex.schema.table('clients', (table) => { table.dropColumn('organization_id'); });
  await knex.schema.table('roles', (table) => { table.dropColumn('is_system_role'); });
};
