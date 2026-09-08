/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('category_id').unsigned().nullable()
      .references('id').inTable('product_categories').onDelete('SET NULL');
    table.string('name', 150).notNullable();
    table.string('sku', 100).nullable().unique();
    table.text('description').nullable();
    table.string('unit', 30).notNullable().defaultTo('unit');
    table.decimal('unit_price', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('tax_rate', 5, 2).notNullable().defaultTo(0.00);
    table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
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
  return knex.schema.dropTableIfExists('products');
};
