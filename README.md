# 📊 Stock Average Calculator

A simple web-based utility to calculate the weighted average buy price of a stock from multiple purchase transactions.

## Features

- ✅ Add multiple buy transactions (price & quantity)
- ✅ Calculate weighted average price
- ✅ Display total quantity, total invested, and average cost
- ✅ Remove individual transactions
- ✅ Reset all data
- ✅ Input validation
- ✅ Responsive design

## Tech Stack

- HTML5
- CSS3 (embedded)
- ES6 JavaScript (modular)
- esbuild (bundler)

## Project Structure

```
stock-avg/
├── index.html          # Main HTML file
├── src/
│   └── js/
│       ├── main.js       # Entry point
│       ├── calculator.js # Calculation logic
│       ├── validator.js  # Input validation
│       └── ui.js         # UI handling
├── dist/
│   └── bundle.js       # Compiled JavaScript (after build)
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Open `index.html` in a browser, or serve it:
   ```bash
   npm run serve
   ```

### Development

For development with auto-rebuild on file changes:

```bash
npm run dev
```

## Usage

1. Enter the **Price per Share** for your stock purchase
2. Enter the **Quantity** of shares bought
3. Click **Add Transaction** to add the entry
4. Repeat for all your purchases
5. View the calculated **Average Buy Price** in the summary

## Example

| Price  | Quantity |
| ------ | -------- |
| 100.00 | 10       |
| 120.00 | 5        |

**Result:**

- Total Quantity: 15
- Total Invested: 1,600.00
- Average Price: **106.67**

## Input Validation

- Price must be greater than 0
- Quantity must be greater than 0
- Decimal values are supported (up to 4 decimal places)
- Empty inputs are not allowed

## License

MIT
