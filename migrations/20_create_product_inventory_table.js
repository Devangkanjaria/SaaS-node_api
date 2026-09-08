/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('product_inventory', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('product_id').unsigned().notNullable().unique()
      .references('id').inTable('products').onDelete('CASCADE');
    table.decimal('quantity', 12, 3).notNullable().defaultTo(0.000);
    table.decimal('reserved_quantity', 12, 3).notNullable().defaultTo(0.000);
    table.decimal('reorder_level', 12, 3).notNullable().defaultTo(0.000);
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('product_inventory');
};
