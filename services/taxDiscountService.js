const { taxRepository, discountRepository } = require("../repositories/taxDiscountRepository");
const { NotFoundError, ConflictError } = require("../errors/errorTypes");

class TaxService {
  async listTaxes() {
    return taxRepository.listTaxes();
  }

  async getTaxById(id) {
    const tax = await taxRepository.findById(id);
    if (!tax) {
      throw new NotFoundError("Tax rate not found");
    }
    return tax;
  }

  async createTax(taxData) {
    const existing = await taxRepository.findByCode(taxData.code);
    if (existing) {
      throw new ConflictError("A tax rate with this code already exists");
    }
    return taxRepository.create(taxData);
  }

  async updateTax(id, updateData) {
    const tax = await taxRepository.findById(id);
    if (!tax) {
      throw new NotFoundError("Tax rate not found");
    }
    return taxRepository.update(id, updateData);
  }

  async updateTaxStatus(id, status) {
    const tax = await taxRepository.findById(id);
    if (!tax) {
      throw new NotFoundError("Tax rate not found");
    }
    return taxRepository.update(id, { status });
  }
}

class DiscountService {
  async listDiscounts() {
    return discountRepository.listDiscounts();
  }

  async getDiscountById(id) {
    const discount = await discountRepository.findById(id);
    if (!discount) {
      throw new NotFoundError("Discount not found");
    }
    return discount;
  }

  async createDiscount(discountData) {
    return discountRepository.create(discountData);
  }

  async updateDiscount(id, updateData) {
    const discount = await discountRepository.findById(id);
    if (!discount) {
      throw new NotFoundError("Discount not found");
    }
    return discountRepository.update(id, updateData);
  }

  async updateDiscountStatus(id, status) {
    const discount = await discountRepository.findById(id);
    if (!discount) {
      throw new NotFoundError("Discount not found");
    }
    return discountRepository.update(id, { status });
  }
}

module.exports = {
  taxService: new TaxService(),
  discountService: new DiscountService(),
};
