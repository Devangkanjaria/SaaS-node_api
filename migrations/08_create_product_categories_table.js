/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('product_categories', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 100).notNullable().unique();
    table.string('description', 255).nullable();
    table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('product_categories');
};
