/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('invoices', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('invoice_number', 50).notNullable().unique();
    table.bigInteger('client_id').unsigned().notNullable()
      .references('id').inTable('clients').onDelete('RESTRICT');
    table.enum('status', ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled']).notNullable().defaultTo('draft');
    table.date('issue_date').notNullable();
    table.date('due_date').nullable();
    table.decimal('subtotal', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('tax_amount', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('total_amount', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('paid_amount', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('balance_amount', 12, 2).notNullable().defaultTo(0.00);
    table.specificType('currency', 'CHAR(3)').notNullable().defaultTo('INR');
    table.text('notes').nullable();
    table.text('terms').nullable();
    table.bigInteger('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('invoices');
};
