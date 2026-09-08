/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('invoice_status_history', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('invoice_id').unsigned().notNullable()
      .references('id').inTable('invoices').onDelete('CASCADE');
    table.string('old_status', 30).nullable();
    table.string('new_status', 30).notNullable();
    table.string('reason', 255).nullable();
    table.bigInteger('changed_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('invoice_status_history');
};
