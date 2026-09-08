/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('client_addresses', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('client_id').unsigned().notNullable()
      .references('id').inTable('clients').onDelete('CASCADE');
    table.enum('address_type', ['billing', 'shipping']).notNullable();
    table.string('address_line1', 255).notNullable();
    table.string('address_line2', 255).nullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('postal_code', 20).notNullable();
    table.string('country', 100).notNullable().defaultTo('India');
    table.boolean('is_default').notNullable().defaultTo(false);
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('client_addresses');
};
