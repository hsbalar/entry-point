/**
 * Stock Average Utility
 * Main entry point - initializes and connects all modules
 */

import { StockCalculator } from "./calculator.js";
import { Validator } from "./validator.js";
import { UI } from "./ui.js";
import { PriceChart } from "./chart.js";

/**
 * Initialize the application when DOM is ready
 */
function init() {
  const calculator = new StockCalculator();
  const chart = new PriceChart("priceChart");
  const ui = new UI(calculator, Validator, chart);
  ui.init();

  // Expose calculator to console for debugging (optional)
  if (typeof window !== "undefined") {
    window.stockCalculator = calculator;
  }

  console.log("Stock Average Utility initialized");
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
