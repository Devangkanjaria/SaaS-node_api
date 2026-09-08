/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('payment_transactions', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('payment_id').unsigned().notNullable()
      .references('id').inTable('payments').onDelete('CASCADE');
    table.string('transaction_id', 150).notNullable().unique();
    table.string('gateway', 50).nullable();
    table.string('gateway_transaction_id', 150).nullable();
    table.decimal('amount', 12, 2).notNullable();
    table.enum('status', ['initiated', 'processing', 'success', 'failed', 'refunded']).notNullable();
    table.json('gateway_response').nullable();
    table.dateTime('processed_at').nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('payment_transactions');
};
