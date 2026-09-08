/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('organizations', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 150).notNullable();
    table.string('slug', 150).notNullable().unique();
    table.string('email', 150).notNullable();
    table.string('phone', 20).nullable();
    table.string('logo_url', 500).nullable();
    table.enum('status', ['active', 'inactive', 'suspended']).notNullable().defaultTo('active');
    table.string('timezone', 50).notNullable().defaultTo('Asia/Kolkata');
    table.specificType('currency', 'CHAR(3)').notNullable().defaultTo('INR');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('organizations');
};
