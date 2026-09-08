/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 50).notNullable();
    table.string('title', 150).notNullable();
    table.text('message').notNullable();
    table.string('entity_type', 50).nullable();
    table.bigInteger('entity_id').unsigned().nullable();
    table.enum('channel', ['in_app', 'email', 'whatsapp', 'sms']).notNullable();
    table.enum('status', ['pending', 'sent', 'failed', 'read']).notNullable().defaultTo('pending');
    table.dateTime('sent_at').nullable();
    table.dateTime('read_at').nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'status'], 'idx_notif_user_status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('notifications');
};
