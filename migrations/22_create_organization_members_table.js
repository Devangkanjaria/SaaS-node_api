/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('organization_members', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('organization_id').unsigned().notNullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
    table.bigInteger('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('role_id').unsigned().notNullable()
      .references('id').inTable('roles').onDelete('RESTRICT');
    table.enum('status', ['active', 'inactive', 'invited']).notNullable().defaultTo('active');
    table.dateTime('joined_at').nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());

    table.unique(['organization_id', 'user_id'], 'uq_org_user');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('organization_members');
};
