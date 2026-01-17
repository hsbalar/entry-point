/**
 * Validator module for input validation
 * Handles validation of price and quantity inputs
 */

export class Validator {
  /**
   * Validates a price value
   * @param {string|number} price - The price to validate
   * @returns {{ valid: boolean, value: number, error: string|null }}
   */
  static validatePrice(price) {
    const result = { valid: false, value: 0, error: null };

    if (price === "" || price === null || price === undefined) {
      result.error = "Price is required";
      return result;
    }

    const numPrice = parseFloat(price);

    if (isNaN(numPrice)) {
      result.error = "Price must be a valid number";
      return result;
    }

    if (numPrice <= 0) {
      result.error = "Price must be greater than 0";
      return result;
    }

    // Round to 4 decimal places
    result.value = Math.round(numPrice * 10000) / 10000;
    result.valid = true;
    return result;
  }

  /**
   * Validates a quantity value
   * @param {string|number} quantity - The quantity to validate
   * @returns {{ valid: boolean, value: number, error: string|null }}
   */
  static validateQuantity(quantity) {
    const result = { valid: false, value: 0, error: null };

    if (quantity === "" || quantity === null || quantity === undefined) {
      result.error = "Quantity is required";
      return result;
    }

    const numQuantity = parseFloat(quantity);

    if (isNaN(numQuantity)) {
      result.error = "Quantity must be a valid number";
      return result;
    }

    if (numQuantity <= 0) {
      result.error = "Quantity must be greater than 0";
      return result;
    }

    // Round to 4 decimal places
    result.value = Math.round(numQuantity * 10000) / 10000;
    result.valid = true;
    return result;
  }

  /**
   * Validates a complete transaction
   * @param {string|number} price - The price to validate
   * @param {string|number} quantity - The quantity to validate
   * @returns {{ valid: boolean, price: number, quantity: number, errors: string[] }}
   */
  static validateTransaction(price, quantity) {
    const result = { valid: true, price: 0, quantity: 0, errors: [] };

    const priceValidation = this.validatePrice(price);
    const quantityValidation = this.validateQuantity(quantity);

    if (!priceValidation.valid) {
      result.valid = false;
      result.errors.push(priceValidation.error);
    } else {
      result.price = priceValidation.value;
    }

    if (!quantityValidation.valid) {
      result.valid = false;
      result.errors.push(quantityValidation.error);
    } else {
      result.quantity = quantityValidation.value;
    }

    return result;
  }
}
