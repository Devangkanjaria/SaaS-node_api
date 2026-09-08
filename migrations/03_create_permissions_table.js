/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('permissions', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 100).notNullable().unique();
    table.string('module', 50).notNullable();
    table.string('action', 50).notNullable();
    table.string('description', 255).nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('permissions');
};
