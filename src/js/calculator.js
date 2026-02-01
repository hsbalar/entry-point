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

  /**
   * Calculates smart averaging scenarios for averaging down or up
   * @param {number} existingAvgPrice - User's current average price
   * @param {number} existingQty - User's current quantity
   * @param {number} currentMarketPrice - Current market price
   * @returns {object} Averaging scenarios and analysis
   */
  calculateSmartAveraging(existingAvgPrice, existingQty, currentMarketPrice) {
    const result = {
      isValidForAveraging: true,
      priceChangePercent: 0,
      isAveragingDown: currentMarketPrice < existingAvgPrice,
      currentInvestment: existingAvgPrice * existingQty,
      scenarios: [],
    };

    // Calculate price change percentage
    const priceDiff = Math.abs(existingAvgPrice - currentMarketPrice);
    result.priceChangePercent = (priceDiff / existingAvgPrice) * 100;

    // Define averaging strategies based on risk levels
    const strategies = [
      { name: "Conservative", multiplier: 0.25, riskLevel: "low", description: "Low risk, minimal additional capital" },
      { name: "Moderate", multiplier: 0.5, riskLevel: "medium", description: "Balanced approach" },
      { name: "Aggressive", multiplier: 1.0, riskLevel: "high", description: "Match existing position" },
      { name: "Double Down", multiplier: 2.0, riskLevel: "high", description: "Double your position" },
    ];

    let bestScenario = null;
    let bestScore = -Infinity;

    strategies.forEach((strategy) => {
      const additionalQty = Math.ceil(existingQty * strategy.multiplier);
      const additionalCapital = additionalQty * currentMarketPrice;
      const newTotalQty = existingQty + additionalQty;
      const newTotalInvestment = result.currentInvestment + additionalCapital;
      const newAvgPrice = newTotalInvestment / newTotalQty;
      const priceChange = Math.abs(existingAvgPrice - newAvgPrice);
      const priceChangePercent = (priceChange / existingAvgPrice) * 100;

      // Calculate a score for recommendation (balance between capital efficiency and price change)
      // Higher score = better recommendation
      const capitalEfficiency = priceChange / additionalCapital; // change per dollar spent
      const riskMultiplier = strategy.riskLevel === "low" ? 1.2 : strategy.riskLevel === "medium" ? 1.0 : 0.8;
      const score = capitalEfficiency * riskMultiplier * 1000;

      const scenario = {
        name: strategy.name,
        description: strategy.description,
        riskLevel: strategy.riskLevel,
        additionalQty,
        additionalCapital,
        newTotalQty,
        newTotalInvestment,
        newAvgPrice,
        priceChange,
        priceChangePercent,
        isAveragingDown: result.isAveragingDown,
        score,
        isRecommended: false,
      };

      result.scenarios.push(scenario);

      // Track best scenario (prefer moderate risk with good efficiency)
      if (score > bestScore) {
        bestScore = score;
        bestScenario = scenario;
      }
    });

    // Mark the recommended scenario
    if (bestScenario) {
      bestScenario.isRecommended = true;
    }

    return result;
  }

  /**
   * Calculates how many shares can be bought with a given budget
   * @param {number} budget - Available investment amount
   * @param {number} stockPrice - Price per share
   * @returns {object} Purchase details including quantity and remaining balance
   */
  calculateBudgetPurchase(budget, stockPrice) {
    if (budget <= 0 || stockPrice <= 0) {
      return {
        maxShares: 0,
        totalCost: 0,
        remainingBalance: budget,
        valid: false,
      };
    }

    const maxShares = Math.floor(budget / stockPrice);
    const totalCost = maxShares * stockPrice;
    const remainingBalance = budget - totalCost;

    return {
      maxShares,
      totalCost,
      remainingBalance,
      valid: true,
    };
  }
}
