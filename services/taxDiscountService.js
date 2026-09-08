const { taxRepository, discountRepository } = require("../repositories/taxDiscountRepository");
const { NotFoundError, ConflictError } = require("../errors/errorTypes");

class TaxService {
  async listTaxes(organizationId) {
    return taxRepository.listTaxes(organizationId);
  }

  async getTaxById(organizationId, id) {
    const tax = await taxRepository.findById(organizationId, id);
    if (!tax) {
      throw new NotFoundError("Tax rate not found in your organization");
    }
    return tax;
  }

  async createTax(organizationId, taxData) {
    const existing = await taxRepository.findByCode(organizationId, taxData.code);
    if (existing) {
      throw new ConflictError("A tax rate with this code already exists in your organization");
    }
    return taxRepository.create({
      ...taxData,
      organization_id: organizationId,
    });
  }

  async updateTax(organizationId, id, updateData) {
    const tax = await taxRepository.findById(organizationId, id);
    if (!tax) {
      throw new NotFoundError("Tax rate not found in your organization");
    }
    return taxRepository.update(organizationId, id, updateData);
  }

  async updateTaxStatus(organizationId, id, status) {
    const tax = await taxRepository.findById(organizationId, id);
    if (!tax) {
      throw new NotFoundError("Tax rate not found in your organization");
    }
    return taxRepository.update(organizationId, id, { status });
  }
}

class DiscountService {
  async listDiscounts(organizationId) {
    return discountRepository.listDiscounts(organizationId);
  }

  async getDiscountById(organizationId, id) {
    const discount = await discountRepository.findById(organizationId, id);
    if (!discount) {
      throw new NotFoundError("Discount not found in your organization");
    }
    return discount;
  }

  async createDiscount(organizationId, discountData) {
    return discountRepository.create({
      ...discountData,
      organization_id: organizationId,
    });
  }

  async updateDiscount(organizationId, id, updateData) {
    const discount = await discountRepository.findById(organizationId, id);
    if (!discount) {
      throw new NotFoundError("Discount not found in your organization");
    }
    return discountRepository.update(organizationId, id, updateData);
  }

  async updateDiscountStatus(organizationId, id, status) {
    const discount = await discountRepository.findById(organizationId, id);
    if (!discount) {
      throw new NotFoundError("Discount not found in your organization");
    }
    return discountRepository.update(organizationId, id, { status });
  }
}

module.exports = {
  taxService: new TaxService(),
  discountService: new DiscountService(),
};
