/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('user_roles', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('role_id').unsigned().notNullable()
      .references('id').inTable('roles').onDelete('CASCADE');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'role_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_roles');
};
