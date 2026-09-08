/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 100).notNullable();
    table.string('email', 150).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('phone', 20).nullable();
    table.enum('status', ['active', 'inactive', 'blocked']).notNullable().defaultTo('active');
    table.dateTime('last_login_at').nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
