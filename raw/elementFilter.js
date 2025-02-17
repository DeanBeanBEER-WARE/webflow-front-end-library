/**
 * Filter Class
 *
 * Initializes multiple filter instances to control the visibility of elements based on user interactions.
 *
 * Options for each FilterInstance:
 * - filterTarget (string): CSS selector for elements to filter.
 * - containerClass (string): CSS selector for the container where filter buttons will be appended.
 * - buttonDuration (number): Transition duration for buttons (default: 300).
 * - hiddenClass (string): CSS class to hide elements (default: "hidden").
 * - useAttributeFilter (boolean): If true, filtering is based on a specified attribute (default: false).
 * - filterFunction (Function|null): Custom function to determine if an element matches.
 * - attributeName (string): Attribute name to use when useAttributeFilter is true.
 * - dynamicList (string): CSS selector for dynamic list filtering.
 * - filters (Array<Object>): Array of filter objects (each with "value" and optionally "text").
 * - buttonClass (string): CSS class for the filter buttons.
 * - buttonActiveClass (string): CSS class for the active filter button.
 *
 * Example instantiation (asynchron sicher):
 * window.addEventListener('DOMContentLoaded', () => {
 *   const filterConfigs = [
 *     {
 *       filterTarget: ".item",
 *       containerClass: ".filter-buttons",
 *       useAttributeFilter: true,
 *       attributeName: "data-category",
 *       buttonClass: "filter-btn",
 *       buttonActiveClass: "active"
 *     }
 *   ];
 *   const filterManager = new Filter(filterConfigs);
 * });
 *
 * @version 1.0.0
 * @license MIT
 */
class Filter {
  constructor(configs) {
    this.filters = configs.map((config, index) => {
      try {
        return new FilterInstance(config);
      } catch (error) {
        console.warn(`FilterInstance ${index + 1} was not added due to errors: ${error.message}`);
        return null;
      }
    }).filter(instance => instance !== null);
  }
}

/**
 * FilterInstance Class
 *
 * Manages filter buttons and filtering logic for a set of DOM elements.
 *
 * @version 1.0.0
 * @license MIT
 */
class FilterInstance {
  constructor(options) {
    this.opt = {
      buttonDuration: 300,
      hiddenClass: "hidden",
      useAttributeFilter: false,
      filterFunction: null,
      ...options
    };
  
    if (!this.opt.filterTarget || !this.opt.containerClass) {
      throw new Error("filterTarget and containerClass are required options.");
    }
  
    this.elements = document.querySelectorAll(this.opt.filterTarget);
    this.parent = document.querySelector(this.opt.containerClass);
    this.currentFilter = null;
  
    if (!this.parent) {
      throw new Error(`Parent container with class "${this.opt.containerClass}" was not found.`);
    }
  
    if (!this.elements.length) {
      console.warn(`No elements found for filterTarget "${this.opt.filterTarget}".`);
    }
  
    if (this.opt.useAttributeFilter) {
      if (!this.opt.attributeName) {
        throw new Error("attributeName must be specified when useAttributeFilter is true.");
      }
      this.filterFunction = (element, filterValue) => {
        const attr = element.getAttribute(this.opt.attributeName);
        if (!attr) return false;
        const values = attr.split(",").map(val => val.trim());
        return values.includes(filterValue);
      };
    } else if (this.opt.filterFunction) {
      this.filterFunction = this.opt.filterFunction;
    } else if (this.opt.dynamicList) {
      this.filterFunction = (element, filterValue) => {
        const dynamicElement = element.querySelector(this.opt.dynamicList);
        if (!dynamicElement) return false;
        const text = dynamicElement.textContent.trim();
        return text === filterValue;
      };
    } else {
      throw new Error("Either filterFunction or dynamicList must be specified when useAttributeFilter is false.");
    }
  
    if (!this.opt.filters) {
      if (this.opt.useAttributeFilter) {
        const attrs = Array.from(this.elements)
          .map(el => el.getAttribute(this.opt.attributeName))
          .filter(attr => attr !== null);
        const uniqueAttrs = [...new Set(attrs)];
        this.opt.filters = uniqueAttrs.map(attr => ({ value: attr }));
      } else if (this.opt.dynamicList) {
        const dynamicElements = document.querySelectorAll(this.opt.dynamicList);
        const texts = Array.from(dynamicElements)
          .map(el => el.textContent.trim())
          .filter(text => text !== "");
        const uniqueTexts = [...new Set(texts)];
        this.opt.filters = uniqueTexts.map(text => ({ value: text }));
      } else {
        throw new Error("Unable to generate filters without filters, attributeName, or dynamicList.");
      }
    }
  
    this._createButtons();
    this._initFilter();
  }
  
  _createButtons() {
    this.opt.filters.forEach(filter => {
      const button = document.createElement("button");
      button.className = this.opt.buttonClass;
      button.textContent = filter.text || filter.value;
      button.dataset.filterValue = filter.value;
      button.style.transition = `all ${this.opt.buttonDuration}ms ease`;
      button.addEventListener("click", () => this._toggleFilter(filter.value, button));
      this.parent.appendChild(button);
    });
  }
  
  _initFilter() {
    // Additional initialization logic if needed.
  }
  
  _toggleFilter(filterValue, button) {
    if (this.currentFilter === filterValue) {
      this._resetFilter();
    } else {
      this._applyFilter(filterValue);
      this.currentFilter = filterValue;
      this._updateActiveButton(button);
    }
  }
  
  _applyFilter(filterValue) {
    this.elements.forEach(element => {
      const isMatch = this.filterFunction(element, filterValue);
      element.classList.toggle(this.opt.hiddenClass, !isMatch);
    });
  }
  
  _resetFilter() {
    this.elements.forEach(element => element.classList.remove(this.opt.hiddenClass));
    this.currentFilter = null;
    this._updateActiveButton(null);
  }
  
  _updateActiveButton(activeButton) {
    const buttons = this.parent.querySelectorAll(`.${this.opt.buttonClass}`);
    buttons.forEach(button => button.classList.remove(this.opt.buttonActiveClass));
    if (activeButton) {
      activeButton.classList.add(this.opt.buttonActiveClass);
    }
  }
}
window.Filter = Filter;
window.FilterInstance = FilterInstance;
