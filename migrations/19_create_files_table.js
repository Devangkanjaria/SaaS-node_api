/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('files', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('entity_type', 50).notNullable();
    table.bigInteger('entity_id').unsigned().notNullable();
    table.string('file_name', 255).notNullable();
    table.string('file_path', 500).notNullable();
    table.string('file_type', 100).nullable();
    table.bigInteger('file_size').unsigned().nullable();
    table.bigInteger('uploaded_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['entity_type', 'entity_id'], 'idx_files_entity');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('files');
};
