/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('taxes', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 100).notNullable();
    table.string('code', 50).notNullable().unique();
    table.decimal('rate', 5, 2).notNullable();
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
  return knex.schema.dropTableIfExists('taxes');
};
