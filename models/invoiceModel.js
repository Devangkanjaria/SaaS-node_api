const db = require("../config/db");

const Invoice = {
  async create(data) {
    const { items, ...header } = data;
    return db.transaction(async (trx) => {
      const [invoice_id] = await trx("invoices").insert(header);
      const itemsToInsert = items.map((item) => ({ ...item, invoice_id }));
      await trx("invoice_items").insert(itemsToInsert);
      return invoice_id;
    });
  },

  async getAll() {
    return db("invoices").orderBy("id", "desc");
  },

  async getById(id) {
    const invoice = await db("invoices").where({ id }).first();
    if (!invoice) return null;
    const items = await db("invoice_items").where({ invoice_id: id });
    return { ...invoice, items };
  },

  async update(id, data) {
    const { items, ...header } = data;

    return db.transaction(async (trx) => {
      // 1. Update the main invoice header details
      await trx("invoices").where({ id }).update(header);

      // 2. Update existing items or insert new ones
      if (items && items.length > 0) {
        for (const item of items) {
          if (item.id) {
            // Update existing item
            await trx("invoice_items").where({ id: item.id }).update(item);
          } else {
            // Insert new item
            await trx("invoice_items").insert({
              ...item,
              invoice_id: id,
            });
          }
        }

        // 3. Delete items that are no longer in the update (optional - handles removed items)
        const itemIds = items.filter((item) => item.id).map((item) => item.id);
        if (itemIds.length > 0) {
          await trx("invoice_items")
            .where({ invoice_id: id })
            .whereNotIn("id", itemIds)
            .del();
        } else {
          // If no existing items, delete all old items
          await trx("invoice_items").where({ invoice_id: id }).del();
        }
      } else {
        // If no items provided, delete all items for this invoice
        await trx("invoice_items").where({ invoice_id: id }).del();
      }

      return id;
    });
  },
  async delete(id) {
    return db.transaction(async (trx) => {
      // 1. Delete associated items first
      await trx("invoice_items").where({ invoice_id: id }).del();
      // 2. Delete the main invoice
      return await trx("invoices").where({ id }).del();
    });
  },
};

module.exports = Invoice;

/*invoices	INSERT, SELECT, UPDATE, DELETE	Used in all CRUD operations in the Model.
invoice_items	INSERT, SELECT, DELETE	Managed alongside the invoice in the Model and Controller.
products	SELECT, JOIN	Used for fetching the product list and joining in getInvoiceById. */
