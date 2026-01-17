/**
 * Chart module for rendering animated price chart
 * Creates an SVG area chart showing price movements
 */

export class PriceChart {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.svg = null;
    this.width = 0;
    this.height = 0;
    this.padding = { top: 20, right: 20, bottom: 30, left: 20 };
    this.data = [];
    this.animationDuration = 500;
    this.init();
  }

  /**
   * Initializes the SVG chart
   */
  init() {
    if (!this.container) return;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("class", "price-chart");
    this.container.appendChild(this.svg);

    // Create defs for gradient
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Area gradient
    const areaGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    areaGradient.setAttribute("id", "areaGradient");
    areaGradient.setAttribute("x1", "0%");
    areaGradient.setAttribute("y1", "0%");
    areaGradient.setAttribute("x2", "0%");
    areaGradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("class", "gradient-start");

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("class", "gradient-end");

    areaGradient.appendChild(stop1);
    areaGradient.appendChild(stop2);
    defs.appendChild(areaGradient);
    this.svg.appendChild(defs);

    // Create area path
    this.areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.areaPath.setAttribute("class", "chart-area");
    this.svg.appendChild(this.areaPath);

    // Create line path
    this.linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.linePath.setAttribute("class", "chart-line");
    this.svg.appendChild(this.linePath);

    // Create dots group
    this.dotsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.dotsGroup.setAttribute("class", "chart-dots");
    this.svg.appendChild(this.dotsGroup);

    // Handle resize
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.resize();
  }

  /**
   * Handles container resize
   */
  resize() {
    if (!this.container || !this.svg) return;

    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.svg.setAttribute("width", this.width);
    this.svg.setAttribute("height", this.height);
    this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);

    this.render();
  }

  /**
   * Updates the chart with new data
   * @param {Array} transactions - Array of transaction objects with price property
   */
  update(transactions) {
    this.data = transactions.map((t, i) => ({
      index: i,
      price: t.price,
      quantity: t.quantity,
    }));
    this.render();
  }

  /**
   * Clears the chart
   */
  clear() {
    this.data = [];
    this.render();
  }

  /**
   * Renders the chart
   */
  render() {
    if (!this.svg || this.width === 0 || this.height === 0) return;

    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;

    if (this.data.length === 0) {
      this.areaPath.setAttribute("d", "");
      this.linePath.setAttribute("d", "");
      this.dotsGroup.innerHTML = "";
      return;
    }

    // Calculate scales
    const prices = this.data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const pricePadding = priceRange * 0.15;

    const scaleX = (index) => {
      if (this.data.length === 1) {
        return this.padding.left + chartWidth / 2;
      }
      return this.padding.left + (index / (this.data.length - 1)) * chartWidth;
    };

    const scaleY = (price) => {
      const normalizedPrice = (price - minPrice + pricePadding) / (priceRange + pricePadding * 2);
      return this.padding.top + chartHeight - normalizedPrice * chartHeight;
    };

    // Generate points
    const points = this.data.map((d, i) => ({
      x: scaleX(i),
      y: scaleY(d.price),
      price: d.price,
    }));

    // Create smooth curve path
    const linePath = this.createSmoothPath(points);

    // Create area path (line path + closing to bottom)
    const areaPath =
      linePath + ` L ${points[points.length - 1].x} ${this.height} ` + ` L ${points[0].x} ${this.height} Z`;

    // Animate paths
    this.animatePath(this.linePath, linePath);
    this.animatePath(this.areaPath, areaPath);

    // Render dots with animation
    this.renderDots(points);
  }

  /**
   * Creates a smooth curved path through points
   * @param {Array} points - Array of {x, y} points
   * @returns {string} SVG path string
   */
  createSmoothPath(points) {
    if (points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const tension = 0.3;

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  }

  /**
   * Animates a path element to a new path
   * @param {SVGPathElement} element - The path element
   * @param {string} newPath - The new path string
   */
  animatePath(element, newPath) {
    const currentPath = element.getAttribute("d") || "";

    if (currentPath === newPath) return;

    // Use CSS transition for smooth animation
    element.style.transition = `d ${this.animationDuration}ms ease-out`;
    element.setAttribute("d", newPath);
  }

  /**
   * Renders animated dots at each data point
   * @param {Array} points - Array of {x, y, price} points
   */
  renderDots(points) {
    // Clear existing dots
    const existingDots = this.dotsGroup.querySelectorAll(".chart-dot");
    const existingLabels = this.dotsGroup.querySelectorAll(".chart-label");

    // Update or create dots
    points.forEach((point, i) => {
      let dot = existingDots[i];
      let label = existingLabels[i];

      if (!dot) {
        // Create outer ring
        const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ring.setAttribute("class", "chart-dot-ring");
        ring.setAttribute("r", "8");
        ring.style.opacity = "0";
        this.dotsGroup.appendChild(ring);

        // Create dot
        dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("class", "chart-dot");
        dot.setAttribute("r", "4");
        dot.style.opacity = "0";
        this.dotsGroup.appendChild(dot);

        // Create label
        label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("class", "chart-label");
        label.style.opacity = "0";
        this.dotsGroup.appendChild(label);

        // Animate in
        requestAnimationFrame(() => {
          ring.style.opacity = "1";
          dot.style.opacity = "1";
          label.style.opacity = "1";
        });
      }

      // Get ring element
      const rings = this.dotsGroup.querySelectorAll(".chart-dot-ring");
      const ring = rings[i];

      // Animate position
      dot.style.transition = `cx ${this.animationDuration}ms ease-out, cy ${this.animationDuration}ms ease-out`;
      ring.style.transition = `cx ${this.animationDuration}ms ease-out, cy ${this.animationDuration}ms ease-out`;
      label.style.transition = `all ${this.animationDuration}ms ease-out`;

      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      ring.setAttribute("cx", point.x);
      ring.setAttribute("cy", point.y);

      // Position label
      label.setAttribute("x", point.x);
      label.setAttribute("y", point.y - 16);
      label.textContent = point.price.toFixed(2);

      // Add trend indicator
      if (i > 0) {
        const prevPrice = points[i - 1].price;
        if (point.price > prevPrice) {
          dot.classList.add("trend-up");
          dot.classList.remove("trend-down");
        } else if (point.price < prevPrice) {
          dot.classList.add("trend-down");
          dot.classList.remove("trend-up");
        } else {
          dot.classList.remove("trend-up", "trend-down");
        }
      }
    });

    // Remove extra dots
    const allDots = this.dotsGroup.querySelectorAll(".chart-dot");
    const allRings = this.dotsGroup.querySelectorAll(".chart-dot-ring");
    const allLabels = this.dotsGroup.querySelectorAll(".chart-label");

    for (let i = points.length; i < allDots.length; i++) {
      allDots[i].style.opacity = "0";
      allRings[i].style.opacity = "0";
      allLabels[i].style.opacity = "0";

      setTimeout(() => {
        allDots[i]?.remove();
        allRings[i]?.remove();
        allLabels[i]?.remove();
      }, this.animationDuration);
    }
  }

  /**
   * Destroys the chart and cleans up
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.svg && this.container) {
      this.container.removeChild(this.svg);
    }
  }
}
