/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('invoice_items', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('invoice_id').unsigned().notNullable()
      .references('id').inTable('invoices').onDelete('CASCADE');
    table.bigInteger('product_id').unsigned().nullable()
      .references('id').inTable('products').onDelete('SET NULL');
    table.string('description', 255).notNullable();
    table.decimal('quantity', 12, 3).notNullable().defaultTo(1.000);
    table.decimal('unit_price', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('tax_rate', 5, 2).notNullable().defaultTo(0.00);
    table.decimal('tax_amount', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('total_amount', 12, 2).notNullable().defaultTo(0.00);
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('invoice_items');
};
