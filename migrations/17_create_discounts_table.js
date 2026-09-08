/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('discounts', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 100).notNullable();
    table.enum('type', ['percentage', 'fixed']).notNullable();
    table.decimal('value', 12, 2).notNullable();
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
  return knex.schema.dropTableIfExists('discounts');
};
