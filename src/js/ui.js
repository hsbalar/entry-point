/**
 * UI module for DOM manipulation and event handling
 * Handles all user interface interactions
 */

export class UI {
  constructor(calculator, validator, chart) {
    this.calculator = calculator;
    this.validator = validator;
    this.chart = chart;
    this.elements = {};
  }

  /**
   * Initializes the UI by caching DOM elements and setting up event listeners
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateDisplay();
  }

  /**
   * Caches DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      priceInput: document.getElementById("price"),
      quantityInput: document.getElementById("quantity"),
      addBtn: document.getElementById("addBtn"),
      resetBtn: document.getElementById("resetBtn"),
      transactionsList: document.getElementById("transactionsList"),
      totalQuantity: document.getElementById("totalQuantity"),
      totalInvested: document.getElementById("totalInvested"),
      averagePrice: document.getElementById("averagePrice"),
      transactionCount: document.getElementById("transactionCount"),
      errorMessage: document.getElementById("errorMessage"),
      form: document.getElementById("transactionForm"),
      mainLayout: document.getElementById("mainLayout"),
      resultsSection: document.getElementById("resultsSection"),
      themeToggle: document.getElementById("themeToggle"),
    };
  }

  /**
   * Binds event listeners to DOM elements
   */
  bindEvents() {
    this.elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddTransaction();
    });

    this.elements.resetBtn.addEventListener("click", () => {
      this.handleReset();
    });

    this.elements.transactionsList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const id = parseInt(e.target.dataset.id, 10);
        this.handleDeleteTransaction(id);
      }
    });

    // Clear error on input
    this.elements.priceInput.addEventListener("input", () => {
      this.clearError();
    });

    this.elements.quantityInput.addEventListener("input", () => {
      this.clearError();
    });

    // Theme toggle
    this.elements.themeToggle.addEventListener("click", () => {
      this.toggleTheme();
    });

    // Initialize theme from localStorage or system preference
    this.initTheme();
  }

  /**
   * Initializes the theme based on localStorage or system preference
   */
  initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  }

  /**
   * Toggles between light and dark theme
   */
  toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  /**
   * Handles adding a new transaction
   */
  handleAddTransaction() {
    const price = this.elements.priceInput.value.trim();
    const quantity = this.elements.quantityInput.value.trim();

    const validation = this.validator.validateTransaction(price, quantity);

    if (!validation.valid) {
      this.showError(validation.errors.join(". "));
      return;
    }

    this.calculator.addTransaction(validation.price, validation.quantity);
    this.clearInputs();
    this.updateDisplay();
    this.elements.priceInput.focus();
  }

  /**
   * Handles deleting a transaction
   * @param {number} id - Transaction ID to delete
   */
  handleDeleteTransaction(id) {
    this.calculator.removeTransaction(id);
    this.updateDisplay();
  }

  /**
   * Handles resetting all data
   */
  handleReset() {
    this.calculator.reset();
    this.clearInputs();
    this.clearError();
    this.updateDisplay();
    this.elements.priceInput.focus();
  }

  /**
   * Updates all display elements with current data
   */
  updateDisplay() {
    const summary = this.calculator.getSummary();
    const transactions = this.calculator.getTransactions();
    const hasTransactions = transactions.length > 0;

    // Toggle layout state based on transactions
    this.toggleLayoutState(hasTransactions);

    // Update summary values
    this.elements.totalQuantity.textContent = this.formatNumber(summary.totalQuantity);
    this.elements.totalInvested.textContent = this.formatCurrency(summary.totalInvested);
    this.elements.averagePrice.textContent = this.formatCurrency(summary.averagePrice);
    this.elements.transactionCount.textContent = summary.transactionCount;

    // Update transactions list
    this.renderTransactions(transactions);

    // Update chart
    if (this.chart) {
      if (hasTransactions) {
        this.chart.update(transactions);
      } else {
        this.chart.clear();
      }
    }
  }

  /**
   * Toggles the layout state between centered (no transactions) and side-by-side (has transactions)
   * @param {boolean} hasTransactions - Whether there are any transactions
   */
  toggleLayoutState(hasTransactions) {
    if (hasTransactions) {
      this.elements.mainLayout.classList.add("has-transactions");
    } else {
      this.elements.mainLayout.classList.remove("has-transactions");
    }
  }

  /**
   * Renders the transactions list
   * @param {Array} transactions - Array of transactions to render
   */
  renderTransactions(transactions) {
    if (transactions.length === 0) {
      this.elements.transactionsList.innerHTML = "";
      return;
    }

    const deleteIcon = `<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

    const html = transactions
      .map(
        (t, index) => `
      <div class="transaction-item">
        <div class="transaction-info">
          <span class="transaction-number">#${index + 1}</span>
          <span class="transaction-details">
            ${this.formatNumber(t.quantity)} shares @ ${this.formatCurrency(t.price)}
          </span>
          <span class="transaction-amount">= ${this.formatCurrency(t.amount)}</span>
        </div>
        <button class="delete-btn" data-id="${t.id}" title="Remove transaction">${deleteIcon}</button>
      </div>
    `
      )
      .join("");

    this.elements.transactionsList.innerHTML = html;
  }

  /**
   * Shows an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.classList.add("visible");
  }

  /**
   * Clears the error message
   */
  clearError() {
    this.elements.errorMessage.textContent = "";
    this.elements.errorMessage.classList.remove("visible");
  }

  /**
   * Clears the input fields
   */
  clearInputs() {
    this.elements.priceInput.value = "";
    this.elements.quantityInput.value = "";
  }

  /**
   * Formats a number with proper decimal places
   * @param {number} value - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(value) {
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toFixed(4).replace(/\.?0+$/, "");
  }

  /**
   * Formats a number as currency
   * @param {number} value - Number to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(value) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
