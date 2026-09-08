/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('audit_logs', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('user_id').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 50).notNullable();
    table.string('entity_type', 50).notNullable();
    table.bigInteger('entity_id').unsigned().notNullable();
    table.json('old_values').nullable();
    table.json('new_values').nullable();
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['entity_type', 'entity_id'], 'idx_audit_entity');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('audit_logs');
};
