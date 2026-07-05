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
    this.restoreSavedTool();
  }

  /**
   * Caches DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      // Original average calculator elements
      priceInput: document.getElementById('price'),
      quantityInput: document.getElementById('quantity'),
      addBtn: document.getElementById('addBtn'),
      resetBtn: document.getElementById('resetBtn'),
      transactionsList: document.getElementById('transactionsList'),
      totalQuantity: document.getElementById('totalQuantity'),
      totalInvested: document.getElementById('totalInvested'),
      averagePrice: document.getElementById('averagePrice'),
      transactionCount: document.getElementById('transactionCount'),
      errorMessage: document.getElementById('errorMessage'),
      form: document.getElementById('transactionForm'),
      mainLayout: document.getElementById('mainLayout'),
      resultsSection: document.getElementById('resultsSection'),
      themeToggle: document.getElementById('themeToggle'),

      // Tool selector elements
      toolSelectorBtn: document.getElementById('toolSelectorBtn'),
      toolDropdown: document.getElementById('toolDropdown'),
      selectedToolName: document.getElementById('selectedToolName'),
      toolPanels: document.querySelectorAll('.tool-panel'),
      toolOptions: document.querySelectorAll('.tool-option'),

      // Smart averaging tool elements
      smartAvgForm: document.getElementById('smartAvgForm'),
      existingAvgPrice: document.getElementById('existingAvgPrice'),
      existingQty: document.getElementById('existingQty'),
      currentMarketPrice: document.getElementById('currentMarketPrice'),
      smartErrorMessage: document.getElementById('smartErrorMessage'),
      resetSmartBtn: document.getElementById('resetSmartBtn'),
      smartResultsSection: document.getElementById('smartResultsSection'),
      smartStatus: document.getElementById('smartStatus'),
      scenariosGrid: document.getElementById('scenariosGrid'),

      // Budget calculator elements
      budgetForm: document.getElementById('budgetForm'),
      availableBudget: document.getElementById('availableBudget'),
      stockPrice: document.getElementById('stockPrice'),
      budgetErrorMessage: document.getElementById('budgetErrorMessage'),
      resetBudgetBtn: document.getElementById('resetBudgetBtn'),
      budgetResultsSection: document.getElementById('budgetResultsSection'),
      maxShares: document.getElementById('maxShares'),
      totalInvestmentBudget: document.getElementById('totalInvestmentBudget'),
      remainingBalance: document.getElementById('remainingBalance'),

      // Profit/Loss calculator elements
      pnlForm: document.getElementById('pnlForm'),
      buyPrice: document.getElementById('buyPrice'),
      pnlQuantity: document.getElementById('pnlQuantity'),
      sellPrice: document.getElementById('sellPrice'),
      pnlErrorMessage: document.getElementById('pnlErrorMessage'),
      resetPnlBtn: document.getElementById('resetPnlBtn'),
      pnlResultsSection: document.getElementById('pnlResultsSection'),
      pnlHero: document.getElementById('pnlHero'),
      pnlAmount: document.getElementById('pnlAmount'),
      pnlPercent: document.getElementById('pnlPercent'),
      pnlInvestment: document.getElementById('pnlInvestment'),
      pnlCurrentValue: document.getElementById('pnlCurrentValue'),
      pnlPerShare: document.getElementById('pnlPerShare'),
      breakEvenItem: document.getElementById('breakEvenItem'),
      breakEvenPercent: document.getElementById('breakEvenPercent'),

      // All results sections
      resultsSections: document.querySelectorAll('.results-section'),
    };

    // Track current tool and results state
    this.currentTool = 'average';
    this.hasSmartResults = false;
    this.hasBudgetResults = false;
    this.hasPnlResults = false;
  }

  /**
   * Binds event listeners to DOM elements
   */
  bindEvents() {
    // Original average calculator events
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTransaction();
    });

    this.elements.resetBtn.addEventListener('click', () => {
      this.handleReset();
    });

    this.elements.transactionsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.dataset.id, 10);
        this.handleDeleteTransaction(id);
      }
    });

    // Clear error on input
    this.elements.priceInput.addEventListener('input', () => {
      this.clearError();
    });

    this.elements.quantityInput.addEventListener('input', () => {
      this.clearError();
    });

    // Theme toggle
    this.elements.themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Initialize theme from localStorage or system preference
    this.initTheme();

    // Tool selector events
    this.elements.toolSelectorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleToolDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tool-selector')) {
        this.closeToolDropdown();
      }
    });

    // Tool option selection
    this.elements.toolOptions.forEach((option) => {
      option.addEventListener('click', () => {
        const tool = option.dataset.tool;
        this.switchTool(tool);
      });
    });

    // Smart averaging tool events
    this.elements.smartAvgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSmartAvgCalculation();
    });

    this.elements.resetSmartBtn.addEventListener('click', () => {
      this.handleSmartReset();
    });

    // Clear smart error on input
    [
      this.elements.existingAvgPrice,
      this.elements.existingQty,
      this.elements.currentMarketPrice,
    ].forEach((input) => {
      input.addEventListener('input', () => {
        this.clearSmartError();
      });
    });

    // Budget calculator events
    this.elements.budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBudgetCalculation();
    });

    this.elements.resetBudgetBtn.addEventListener('click', () => {
      this.handleBudgetReset();
    });

    // Clear budget error on input
    [this.elements.availableBudget, this.elements.stockPrice].forEach(
      (input) => {
        input.addEventListener('input', () => {
          this.clearBudgetError();
        });
      }
    );

    // Profit/Loss calculator events
    this.elements.pnlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePnlCalculation();
    });

    this.elements.resetPnlBtn.addEventListener('click', () => {
      this.handlePnlReset();
    });

    // Clear P&L error on input
    [
      this.elements.buyPrice,
      this.elements.pnlQuantity,
      this.elements.sellPrice,
    ].forEach((input) => {
      input.addEventListener('input', () => {
        this.clearPnlError();
      });
    });
  }

  /**
   * Initializes the theme based on localStorage or system preference
   */
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }

  /**
   * Toggles between light and dark theme
   */
  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  /**
   * Handles adding a new transaction
   */
  handleAddTransaction() {
    const price = this.elements.priceInput.value.trim();
    const quantity = this.elements.quantityInput.value.trim();

    const validation = this.validator.validateTransaction(price, quantity);

    if (!validation.valid) {
      this.showError(validation.errors.join('. '));
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
    this.elements.totalQuantity.textContent = this.formatNumber(
      summary.totalQuantity
    );
    this.elements.totalInvested.textContent = this.formatCurrency(
      summary.totalInvested
    );
    this.elements.averagePrice.textContent = this.formatCurrency(
      summary.averagePrice
    );
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
    if (this.currentTool === 'average') {
      if (hasTransactions) {
        this.elements.mainLayout.classList.add('has-transactions');
        this.elements.resultsSection.classList.add('active');
      } else {
        this.elements.mainLayout.classList.remove('has-transactions');
        this.elements.resultsSection.classList.remove('active');
      }
    }
  }

  /**
   * Renders the transactions list
   * @param {Array} transactions - Array of transactions to render
   */
  renderTransactions(transactions) {
    if (transactions.length === 0) {
      this.elements.transactionsList.innerHTML = '';
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
            ${this.formatNumber(t.quantity)} shares @ ${this.formatCurrency(
          t.price
        )}
          </span>
          <span class="transaction-amount">= ${this.formatCurrency(
            t.amount
          )}</span>
        </div>
        <button class="delete-btn" data-id="${
          t.id
        }" title="Remove transaction">${deleteIcon}</button>
      </div>
    `
      )
      .join('');

    this.elements.transactionsList.innerHTML = html;
  }

  /**
   * Shows an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.classList.add('visible');
  }

  /**
   * Clears the error message
   */
  clearError() {
    this.elements.errorMessage.textContent = '';
    this.elements.errorMessage.classList.remove('visible');
  }

  /**
   * Clears the input fields
   */
  clearInputs() {
    this.elements.priceInput.value = '';
    this.elements.quantityInput.value = '';
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
    return value.toFixed(4).replace(/\.?0+$/, '');
  }

  /**
   * Formats a number as currency
   * @param {number} value - Number to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(value) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // =====================================================
  // TOOL SELECTOR METHODS
  // =====================================================

  /**
   * Toggles the tool dropdown visibility
   */
  toggleToolDropdown() {
    const selector = this.elements.toolSelectorBtn.closest('.tool-selector');
    selector.classList.toggle('open');
  }

  /**
   * Closes the tool dropdown
   */
  closeToolDropdown() {
    const selector = this.elements.toolSelectorBtn.closest('.tool-selector');
    selector.classList.remove('open');
  }

  /**
   * Switches to a different tool
   * @param {string} tool - The tool identifier
   */
  switchTool(tool) {
    if (this.currentTool === tool) {
      this.closeToolDropdown();
      return;
    }

    this.currentTool = tool;

    // Save to localStorage
    localStorage.setItem('selectedTool', tool);

    // Update tool options active state
    this.elements.toolOptions.forEach((option) => {
      option.classList.toggle('active', option.dataset.tool === tool);
    });

    // Update selected tool name
    const toolNames = {
      average: 'Average Calculator',
      smart: 'Smart Averaging',
      budget: 'Budget Calculator',
      pnl: 'P&L Calculator',
    };
    this.elements.selectedToolName.textContent =
      toolNames[tool] || 'Select Tool';

    // Show/hide tool panels
    this.elements.toolPanels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.dataset.tool !== tool);
    });

    // Update results sections visibility based on tool
    this.updateResultsSectionVisibility();

    // Auto-focus on first input of the selected tool
    this.focusFirstInput(tool);

    this.closeToolDropdown();
  }

  /**
   * Focuses on the first input field of the specified tool
   * @param {string} tool - The tool identifier
   */
  focusFirstInput(tool) {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      switch (tool) {
        case 'average':
          this.elements.priceInput.focus();
          break;
        case 'smart':
          this.elements.existingAvgPrice.focus();
          break;
        case 'budget':
          this.elements.availableBudget.focus();
          break;
        case 'pnl':
          this.elements.buyPrice.focus();
          break;
      }
    }, 100);
  }

  /**
   * Restores the previously selected tool from localStorage
   */
  restoreSavedTool() {
    const savedTool = localStorage.getItem('selectedTool');
    if (
      savedTool &&
      ['average', 'smart', 'budget', 'pnl'].includes(savedTool)
    ) {
      this.switchTool(savedTool);
    }
  }

  /**
   * Updates the visibility of results sections based on current tool and results state
   */
  updateResultsSectionVisibility() {
    // Hide all results sections first
    this.elements.resultsSections.forEach((section) => {
      section.classList.remove('active');
    });

    // Remove all layout state classes
    this.elements.mainLayout.classList.remove(
      'has-transactions',
      'has-results'
    );

    // Show appropriate results section based on tool
    if (this.currentTool === 'average') {
      const hasTransactions = this.calculator.getTransactionCount() > 0;
      if (hasTransactions) {
        this.elements.mainLayout.classList.add('has-transactions');
        this.elements.resultsSection.classList.add('active');
      }
    } else if (this.currentTool === 'smart' && this.hasSmartResults) {
      this.elements.mainLayout.classList.add('has-results');
      this.elements.smartResultsSection.classList.add('active');
    } else if (this.currentTool === 'budget' && this.hasBudgetResults) {
      this.elements.mainLayout.classList.add('has-results');
      this.elements.budgetResultsSection.classList.add('active');
    } else if (this.currentTool === 'pnl' && this.hasPnlResults) {
      this.elements.mainLayout.classList.add('has-results');
      this.elements.pnlResultsSection.classList.add('active');
    }
  }

  // =====================================================
  // SMART AVERAGING ASSISTANT METHODS
  // =====================================================

  /**
   * Handles the smart averaging calculation
   */
  handleSmartAvgCalculation() {
    const avgPrice = this.elements.existingAvgPrice.value.trim();
    const qty = this.elements.existingQty.value.trim();
    const marketPrice = this.elements.currentMarketPrice.value.trim();

    // Validate inputs
    const avgPriceValidation = this.validator.validatePrice(avgPrice);
    const qtyValidation = this.validator.validateQuantity(qty);
    const marketPriceValidation = this.validator.validatePrice(marketPrice);

    const errors = [];
    if (!avgPriceValidation.valid)
      errors.push('Average price: ' + avgPriceValidation.error);
    if (!qtyValidation.valid) errors.push('Quantity: ' + qtyValidation.error);
    if (!marketPriceValidation.valid)
      errors.push('Market price: ' + marketPriceValidation.error);

    if (errors.length > 0) {
      this.showSmartError(errors.join('. '));
      return;
    }

    // Calculate scenarios
    const result = this.calculator.calculateSmartAveraging(
      avgPriceValidation.value,
      qtyValidation.value,
      marketPriceValidation.value
    );

    this.displaySmartResults(result);
  }

  /**
   * Displays the smart averaging results
   * @param {object} result - The calculation result
   */
  displaySmartResults(result) {
    // Mark that we have results and show the results section
    this.hasSmartResults = true;
    this.updateResultsSectionVisibility();

    // Update status based on averaging direction
    if (result.isAveragingDown) {
      this.elements.smartStatus.className = 'smart-status success';
      this.elements.smartStatus.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Stock is down ${this.formatNumber(
          result.priceChangePercent
        )}% — Good opportunity to average down!
      `;
    } else {
      this.elements.smartStatus.className = 'smart-status info';
      this.elements.smartStatus.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
        Stock is up ${this.formatNumber(
          result.priceChangePercent
        )}% — Averaging up will increase your average price.
      `;
    }

    // Render scenarios
    this.elements.scenariosGrid.innerHTML = result.scenarios
      .map((scenario) => this.renderScenarioCard(scenario))
      .join('');
  }

  /**
   * Renders a single scenario card
   * @param {object} scenario - The scenario data
   * @returns {string} HTML string
   */
  renderScenarioCard(scenario) {
    const riskFillWidth =
      scenario.riskLevel === 'low'
        ? 33
        : scenario.riskLevel === 'medium'
        ? 66
        : 100;
    const priceChangeLabel = scenario.isAveragingDown
      ? 'Price Reduction'
      : 'Price Increase';
    const priceChangeClass = scenario.isAveragingDown
      ? 'reduction'
      : 'increase';
    const priceChangeSign = scenario.isAveragingDown ? '-' : '+';

    return `
      <div class="scenario-card ${scenario.isRecommended ? 'recommended' : ''}">
        <div class="scenario-header">
          <div class="scenario-type">
            <div class="scenario-type-icon">
              ${this.getScenarioIcon(scenario.riskLevel)}
            </div>
            <span class="scenario-type-name">${scenario.name}</span>
          </div>
          ${
            scenario.isRecommended
              ? '<span class="scenario-badge">Recommended</span>'
              : ''
          }
        </div>
        <div class="scenario-details">
          <div class="scenario-detail">
            <div class="scenario-detail-label">Buy Quantity</div>
            <div class="scenario-detail-value">${this.formatNumber(
              scenario.additionalQty
            )} shares</div>
          </div>
          <div class="scenario-detail">
            <div class="scenario-detail-label">Capital Required</div>
            <div class="scenario-detail-value">${this.formatCurrency(
              scenario.additionalCapital
            )}</div>
          </div>
          <div class="scenario-detail">
            <div class="scenario-detail-label">New Average</div>
            <div class="scenario-detail-value highlight">${this.formatCurrency(
              scenario.newAvgPrice
            )}</div>
          </div>
          <div class="scenario-detail">
            <div class="scenario-detail-label">${priceChangeLabel}</div>
            <div class="scenario-detail-value ${priceChangeClass}">${priceChangeSign}${this.formatNumber(
      scenario.priceChangePercent
    )}%</div>
          </div>
        </div>
        <div class="scenario-metrics">
          <div class="scenario-metric">
            <span>Risk:</span>
            <div class="scenario-metric-bar">
              <div class="scenario-metric-fill risk-${
                scenario.riskLevel
              }" style="width: ${riskFillWidth}%"></div>
            </div>
            <span>${scenario.riskLevel}</span>
          </div>
          <div class="scenario-metric">
            <span>Total Qty: ${this.formatNumber(scenario.newTotalQty)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gets the icon SVG for a risk level
   * @param {string} riskLevel - The risk level
   * @returns {string} SVG HTML string
   */
  getScenarioIcon(riskLevel) {
    switch (riskLevel) {
      case 'low':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
      case 'medium':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
      case 'high':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
      default:
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
    }
  }

  /**
   * Shows an error message for smart averaging tool
   * @param {string} message - Error message to display
   */
  showSmartError(message) {
    this.elements.smartErrorMessage.textContent = message;
    this.elements.smartErrorMessage.classList.add('visible');
  }

  /**
   * Clears the smart averaging error message
   */
  clearSmartError() {
    this.elements.smartErrorMessage.textContent = '';
    this.elements.smartErrorMessage.classList.remove('visible');
  }

  /**
   * Resets the smart averaging tool
   */
  handleSmartReset() {
    this.elements.existingAvgPrice.value = '';
    this.elements.existingQty.value = '';
    this.elements.currentMarketPrice.value = '';
    this.clearSmartError();
    this.hasSmartResults = false;
    this.updateResultsSectionVisibility();
    this.elements.existingAvgPrice.focus();
  }

  // =====================================================
  // BUDGET CALCULATOR METHODS
  // =====================================================

  /**
   * Handles the budget calculation
   */
  handleBudgetCalculation() {
    const budget = this.elements.availableBudget.value.trim();
    const price = this.elements.stockPrice.value.trim();

    // Validate inputs
    const budgetValidation = this.validator.validatePrice(budget);
    const priceValidation = this.validator.validatePrice(price);

    const errors = [];
    if (!budgetValidation.valid)
      errors.push('Budget: ' + budgetValidation.error);
    if (!priceValidation.valid)
      errors.push('Stock price: ' + priceValidation.error);

    if (errors.length > 0) {
      this.showBudgetError(errors.join('. '));
      return;
    }

    // Calculate purchase
    const result = this.calculator.calculateBudgetPurchase(
      budgetValidation.value,
      priceValidation.value
    );

    this.displayBudgetResults(result);
  }

  /**
   * Displays the budget calculation results
   * @param {object} result - The calculation result
   */
  displayBudgetResults(result) {
    // Mark that we have results and show the results section
    this.hasBudgetResults = true;
    this.updateResultsSectionVisibility();

    this.elements.maxShares.textContent = this.formatNumber(result.maxShares);
    this.elements.totalInvestmentBudget.textContent = this.formatCurrency(
      result.totalCost
    );
    this.elements.remainingBalance.textContent = this.formatCurrency(
      result.remainingBalance
    );
  }

  /**
   * Shows an error message for budget tool
   * @param {string} message - Error message to display
   */
  showBudgetError(message) {
    this.elements.budgetErrorMessage.textContent = message;
    this.elements.budgetErrorMessage.classList.add('visible');
  }

  /**
   * Clears the budget error message
   */
  clearBudgetError() {
    this.elements.budgetErrorMessage.textContent = '';
    this.elements.budgetErrorMessage.classList.remove('visible');
  }

  /**
   * Resets the budget calculator
   */
  handleBudgetReset() {
    this.elements.availableBudget.value = '';
    this.elements.stockPrice.value = '';
    this.clearBudgetError();
    this.hasBudgetResults = false;
    this.updateResultsSectionVisibility();
    this.elements.availableBudget.focus();
  }

  // =====================================================
  // PROFIT/LOSS CALCULATOR METHODS
  // =====================================================

  /**
   * Handles the P&L calculation
   */
  handlePnlCalculation() {
    const buyPrice = this.elements.buyPrice.value.trim();
    const quantity = this.elements.pnlQuantity.value.trim();
    const sellPrice = this.elements.sellPrice.value.trim();

    // Validate inputs
    const buyPriceValidation = this.validator.validatePrice(buyPrice);
    const quantityValidation = this.validator.validateQuantity(quantity);
    const sellPriceValidation = this.validator.validatePrice(sellPrice);

    const errors = [];
    if (!buyPriceValidation.valid)
      errors.push('Buy price: ' + buyPriceValidation.error);
    if (!quantityValidation.valid)
      errors.push('Quantity: ' + quantityValidation.error);
    if (!sellPriceValidation.valid)
      errors.push('Sell price: ' + sellPriceValidation.error);

    if (errors.length > 0) {
      this.showPnlError(errors.join('. '));
      return;
    }

    // Calculate P&L
    const result = this.calculator.calculateProfitLoss(
      buyPriceValidation.value,
      quantityValidation.value,
      sellPriceValidation.value
    );

    this.displayPnlResults(result);
  }

  /**
   * Displays the P&L calculation results
   * @param {object} result - The calculation result
   */
  displayPnlResults(result) {
    // Mark that we have results and show the results section
    this.hasPnlResults = true;
    this.updateResultsSectionVisibility();

    // Update hero section with profit/loss state
    this.elements.pnlHero.classList.remove('profit', 'loss', 'neutral');
    if (result.profitLoss > 0) {
      this.elements.pnlHero.classList.add('profit');
    } else if (result.profitLoss < 0) {
      this.elements.pnlHero.classList.add('loss');
    } else {
      this.elements.pnlHero.classList.add('neutral');
    }

    // Format the P&L amount with sign
    const sign = result.profitLoss >= 0 ? '+' : '';
    this.elements.pnlAmount.textContent =
      sign + this.formatCurrency(result.profitLoss);
    this.elements.pnlPercent.textContent =
      sign + this.formatNumber(result.profitLossPercent) + '%';

    // Update details
    this.elements.pnlInvestment.textContent = this.formatCurrency(
      result.totalInvestment
    );
    this.elements.pnlCurrentValue.textContent = this.formatCurrency(
      result.currentValue
    );

    const perShareSign = result.perSharePL >= 0 ? '+' : '';
    this.elements.pnlPerShare.textContent =
      perShareSign + this.formatCurrency(result.perSharePL);

    // Show break-even only when in loss
    if (result.profitLoss < 0) {
      this.elements.breakEvenItem.style.display = 'flex';
      this.elements.breakEvenPercent.textContent =
        '+' + this.formatNumber(result.breakEvenPercent) + '%';
    } else {
      this.elements.breakEvenItem.style.display = 'none';
    }
  }

  /**
   * Shows an error message for P&L tool
   * @param {string} message - Error message to display
   */
  showPnlError(message) {
    this.elements.pnlErrorMessage.textContent = message;
    this.elements.pnlErrorMessage.classList.add('visible');
  }

  /**
   * Clears the P&L error message
   */
  clearPnlError() {
    this.elements.pnlErrorMessage.textContent = '';
    this.elements.pnlErrorMessage.classList.remove('visible');
  }

  /**
   * Resets the P&L calculator
   */
  handlePnlReset() {
    this.elements.buyPrice.value = '';
    this.elements.pnlQuantity.value = '';
    this.elements.sellPrice.value = '';
    this.clearPnlError();
    this.hasPnlResults = false;
    this.updateResultsSectionVisibility();
    this.elements.buyPrice.focus();
  }
}
