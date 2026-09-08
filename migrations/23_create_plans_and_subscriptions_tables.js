/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. Create plans table
  await knex.schema.createTable('plans', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 100).notNullable();
    table.string('code', 50).notNullable().unique();
    table.text('description').nullable();
    table.decimal('price', 12, 2).notNullable().defaultTo(0.00);
    table.enum('billing_interval', ['monthly', 'yearly']).notNullable().defaultTo('monthly');
    table.integer('max_users').notNullable().defaultTo(1);
    table.integer('max_clients').nullable();
    table.integer('max_products').nullable();
    table.integer('max_invoices').nullable();
    table.integer('max_storage_mb').nullable();
    table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // 2. Create subscriptions table
  await knex.schema.createTable('subscriptions', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('organization_id').unsigned().notNullable()
      .references('id').inTable('organizations').onDelete('CASCADE');
    table.bigInteger('plan_id').unsigned().notNullable()
      .references('id').inTable('plans').onDelete('RESTRICT');
    table.enum('status', ['trial', 'active', 'past_due', 'cancelled', 'expired']).notNullable().defaultTo('trial');
    table.dateTime('starts_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('ends_at').nullable();
    table.dateTime('trial_ends_at').nullable();
    table.dateTime('cancelled_at').nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // 3. Create subscription_transactions table
  await knex.schema.createTable('subscription_transactions', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('subscription_id').unsigned().notNullable()
      .references('id').inTable('subscriptions').onDelete('CASCADE');
    table.string('transaction_id', 150).notNullable().unique();
    table.string('gateway', 50).notNullable();
    table.string('gateway_transaction_id', 150).nullable();
    table.decimal('amount', 12, 2).notNullable();
    table.specificType('currency', 'CHAR(3)').notNullable().defaultTo('INR');
    table.enum('status', ['pending', 'success', 'failed', 'refunded']).notNullable().defaultTo('pending');
    table.json('gateway_response').nullable();
    table.dateTime('paid_at').nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('subscription_transactions');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('plans');
};
