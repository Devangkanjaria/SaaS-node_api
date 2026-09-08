const { taxService, discountService } = require("../services/taxDiscountService");
const { sendSuccess, sendCreated } = require("../utils/responseHandler");

class TaxController {
  async listTaxes(req, res, next) {
    try {
      const taxes = await taxService.listTaxes(req.organizationId);
      return sendSuccess(res, "Taxes fetched successfully", taxes);
    } catch (err) {
      next(err);
    }
  }

  async getTaxById(req, res, next) {
    try {
      const tax = await taxService.getTaxById(req.organizationId, req.params.id);
      return sendSuccess(res, "Tax fetched successfully", tax);
    } catch (err) {
      next(err);
    }
  }

  async createTax(req, res, next) {
    try {
      const tax = await taxService.createTax(req.organizationId, req.body);
      return sendCreated(res, "Tax created successfully", tax);
    } catch (err) {
      next(err);
    }
  }

  async updateTax(req, res, next) {
    try {
      const tax = await taxService.updateTax(req.organizationId, req.params.id, req.body);
      return sendSuccess(res, "Tax updated successfully", tax);
    } catch (err) {
      next(err);
    }
  }

  async updateTaxStatus(req, res, next) {
    try {
      const tax = await taxService.updateTaxStatus(req.organizationId, req.params.id, req.body.status);
      return sendSuccess(res, "Tax status updated successfully", tax);
    } catch (err) {
      next(err);
    }
  }
}

class DiscountController {
  async listDiscounts(req, res, next) {
    try {
      const discounts = await discountService.listDiscounts(req.organizationId);
      return sendSuccess(res, "Discounts fetched successfully", discounts);
    } catch (err) {
      next(err);
    }
  }

  async getDiscountById(req, res, next) {
    try {
      const discount = await discountService.getDiscountById(req.organizationId, req.params.id);
      return sendSuccess(res, "Discount fetched successfully", discount);
    } catch (err) {
      next(err);
    }
  }

  async createDiscount(req, res, next) {
    try {
      const discount = await discountService.createDiscount(req.organizationId, req.body);
      return sendCreated(res, "Discount created successfully", discount);
    } catch (err) {
      next(err);
    }
  }

  async updateDiscount(req, res, next) {
    try {
      const discount = await discountService.updateDiscount(req.organizationId, req.params.id, req.body);
      return sendSuccess(res, "Discount updated successfully", discount);
    } catch (err) {
      next(err);
    }
  }

  async updateDiscountStatus(req, res, next) {
    try {
      const discount = await discountService.updateDiscountStatus(req.organizationId, req.params.id, req.body.status);
      return sendSuccess(res, "Discount status updated successfully", discount);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = {
  taxController: new TaxController(),
  discountController: new DiscountController(),
};
