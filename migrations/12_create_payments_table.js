/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('payments', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('invoice_id').unsigned().notNullable()
      .references('id').inTable('invoices').onDelete('RESTRICT');
    table.decimal('amount', 12, 2).notNullable();
    table.enum('payment_method', ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'gateway', 'other']).notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'refunded', 'cancelled']).notNullable().defaultTo('completed');
    table.string('reference_number', 100).nullable();
    table.dateTime('paid_at').nullable();
    table.string('notes', 255).nullable();
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
  return knex.schema.dropTableIfExists('payments');
};
