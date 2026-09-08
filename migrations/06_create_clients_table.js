/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('clients', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 150).notNullable();
    table.string('email', 150).nullable();
    table.string('phone', 20).nullable();
    table.string('company_name', 150).nullable();
    table.string('tax_number', 50).nullable();
    table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
    table.text('notes').nullable();
    table.bigInteger('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('clients');
};
