/**
 * Calculator module for stock average calculations
 * Handles all calculation logic for the stock average utility
 */

export class StockCalculator {
  constructor() {
    this.transactions = [];
  }

  /**
   * Adds a transaction to the list
   * @param {number} price - The buy price per share
   * @param {number} quantity - The number of shares bought
   * @returns {object} The added transaction with calculated amount
   */
  addTransaction(price, quantity) {
    const transaction = {
      id: Date.now(),
      price,
      quantity,
      amount: price * quantity,
    };
    this.transactions.push(transaction);
    return transaction;
  }

  /**
   * Removes a transaction by ID
   * @param {number} id - The transaction ID to remove
   * @returns {boolean} Whether the transaction was removed
   */
  removeTransaction(id) {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.transactions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Gets all transactions
   * @returns {Array} All transactions
   */
  getTransactions() {
    return [...this.transactions];
  }

  /**
   * Calculates the total quantity of all transactions
   * @returns {number} Total quantity
   */
  getTotalQuantity() {
    return this.transactions.reduce((sum, t) => sum + t.quantity, 0);
  }

  /**
   * Calculates the total invested amount
   * @returns {number} Total invested amount
   */
  getTotalInvested() {
    return this.transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculates the weighted average price
   * @returns {number} Average price (0 if no transactions)
   */
  getAveragePrice() {
    const totalQuantity = this.getTotalQuantity();
    if (totalQuantity === 0) return 0;
    return this.getTotalInvested() / totalQuantity;
  }

  /**
   * Gets a summary of all calculations
   * @returns {object} Summary with totalQuantity, totalInvested, and averagePrice
   */
  getSummary() {
    return {
      totalQuantity: this.getTotalQuantity(),
      totalInvested: this.getTotalInvested(),
      averagePrice: this.getAveragePrice(),
      transactionCount: this.transactions.length,
    };
  }

  /**
   * Clears all transactions
   */
  reset() {
    this.transactions = [];
  }

  /**
   * Gets the number of transactions
   * @returns {number} Transaction count
   */
  getTransactionCount() {
    return this.transactions.length;
  }
}
