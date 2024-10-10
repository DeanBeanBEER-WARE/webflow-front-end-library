/**
 * Filter Class
 * 
 * This class initializes multiple filter instances based on the provided configuration array.
 * Each configuration object is used to create a new FilterInstance. If an error occurs during
 * the creation of a FilterInstance, a warning is logged, and the instance is not added.
 */
class Filter {
    /**
     * Constructs a new Filter instance.
     * 
     * @param {Array<Object>} configs - An array of configuration objects for each FilterInstance.
     */
    constructor(configs) {
        /**
         * @type {Array<FilterInstance>}
         * @description Array to hold successfully created FilterInstance objects.
         */
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
 * This class handles the creation and management of filter buttons and the filtering logic
 * for a set of DOM elements based on the provided options.
 */
class FilterInstance {
    /**
     * Constructs a new FilterInstance.
     * 
     * @param {Object} options - Configuration options for the filter.
     * @param {string} options.filterTarget - CSS selector for the elements to be filtered.
     * @param {string} options.containerClass - CSS class for the parent container where filter buttons will be appended.
     * @param {number} [options.buttonDuration=300] - Duration of the button transition in milliseconds.
     * @param {string} [options.hiddenClass="hidden"] - CSS class to hide elements that do not match the filter.
     * @param {boolean} [options.useAttributeFilter=false] - Determines if filtering should be based on a specific attribute.
     * @param {function} [options.filterFunction=null] - Custom filter function to determine element visibility.
     * @param {string} [options.attributeName] - Name of the attribute to use when `useAttributeFilter` is true.
     * @param {string} [options.dynamicList] - CSS selector for dynamic list elements used in filtering.
     * @param {Array<Object>} [options.filters] - Array of filter objects. Each object should have a `value` and optionally `text`.
     * @param {string} [options.buttonClass] - CSS class for the filter buttons.
     * @param {string} [options.buttonActiveClass] - CSS class for the active filter button.
     */
    constructor(options) {
        /**
         * @type {Object}
         * @description Merged options with default values.
         */
        this.opt = {
            buttonDuration: 300,
            hiddenClass: "hidden",
            useAttributeFilter: false,
            filterFunction: null,
            ...options
        };

        // Validate required options
        if (!this.opt.filterTarget || !this.opt.containerClass) {
            throw new Error("filterTarget and containerClass are required options.");
        }

        /**
         * @type {NodeListOf<Element>}
         * @description The elements to be filtered based on the filter criteria.
         */
        this.elements = document.querySelectorAll(this.opt.filterTarget);

        /**
         * @type {HTMLElement|null}
         * @description The parent container where filter buttons will be appended.
         */
        this.parent = document.querySelector(this.opt.containerClass);

        /**
         * @type {string|null}
         * @description The currently active filter value.
         */
        this.currentFilter = null;

        // Validate parent container
        if (!this.parent) {
            throw new Error(`Parent container with class "${this.opt.containerClass}" was not found.`);
        }

        // Warn if no elements are found to filter
        if (!this.elements.length) {
            console.warn(`No elements found for filterTarget "${this.opt.filterTarget}".`);
        }

        // Initialize the filter function based on the options
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

        // Generate filters if not provided
        if (!this.opt.filters) {
            if (this.opt.useAttributeFilter) {
                const attrs = Array.from(this.elements)
                    .map(el => el.getAttribute(this.opt.attributeName))
                    .filter(attr => attr !== null);
                const uniqueAttrs = [...new Set(attrs)];
                this.opt.filters = uniqueAttrs.map(attr => ({
                    value: attr
                }));
            } else if (this.opt.dynamicList) {
                const dynamicElements = document.querySelectorAll(this.opt.dynamicList);
                const texts = Array.from(dynamicElements)
                    .map(el => el.textContent.trim())
                    .filter(text => text !== "");
                const uniqueTexts = [...new Set(texts)];
                this.opt.filters = uniqueTexts.map(text => ({
                    value: text
                }));
            } else {
                throw new Error("Unable to generate filters without filters, attributeName, or dynamicList.");
            }
        }

        // Create filter buttons and initialize filtering
        this._createButtons();
        this._initFilter();
    }

    /**
     * Creates filter buttons based on the filters provided in the options.
     * Each button is appended to the parent container and set up with event listeners.
     * 
     * @private
     */
    _createButtons() {
        this.opt.filters.forEach(filter => {
            const button = document.createElement("button");
            button.className = this.opt.buttonClass;
            button.textContent = filter.text || filter.value;
            button.dataset.filterValue = filter.value;
            button.style.transition = `all ${this.opt.buttonDuration}ms ease`;

            // Add click event listener to toggle the filter
            button.addEventListener("click", () => this._toggleFilter(filter.value, button));

            // Append the button to the parent container
            this.parent.appendChild(button);
        });
    }

    /**
     * Initializes the filter state. This method can be expanded to set a default filter or other initialization logic.
     * 
     * @private
     */
    _initFilter() {
        // Initialization logic can be added here if needed
    }

    /**
     * Toggles the filter based on the selected filter value.
     * If the selected filter is already active, it resets the filter. Otherwise, it applies the new filter.
     * 
     * @param {string} filterValue - The value of the filter to toggle.
     * @param {HTMLElement} button - The button element that was clicked.
     * @private
     */
    _toggleFilter(filterValue, button) {
        if (this.currentFilter === filterValue) {
            this._resetFilter();
        } else {
            this._applyFilter(filterValue);
            this.currentFilter = filterValue;
            this._updateActiveButton(button);
        }
    }

    /**
     * Applies the specified filter to the elements.
     * Elements that do not match the filter criteria will have the hiddenClass added.
     * 
     * @param {string} filterValue - The value of the filter to apply.
     * @private
     */
    _applyFilter(filterValue) {
        this.elements.forEach(element => {
            const isMatch = this.filterFunction(element, filterValue);
            element.classList.toggle(this.opt.hiddenClass, !isMatch);
        });
    }

    /**
     * Resets the filter, making all elements visible and clearing the current filter state.
     * 
     * @private
     */
    _resetFilter() {
        this.elements.forEach(element => element.classList.remove(this.opt.hiddenClass));
        this.currentFilter = null;
        this._updateActiveButton(null);
    }

    /**
     * Updates the active state of the filter buttons.
     * Removes the active class from all buttons and adds it to the specified button.
     * 
     * @param {HTMLElement|null} activeButton - The button to set as active. If null, no button is active.
     * @private
     */
    _updateActiveButton(activeButton) {
        const buttons = this.parent.querySelectorAll(`.${this.opt.buttonClass}`);
        buttons.forEach(button => button.classList.remove(this.opt.buttonActiveClass));
        if (activeButton) {
            activeButton.classList.add(this.opt.buttonActiveClass);
        }
    }
}

/*
 * Documentation
 * 
 * Filter Class
 * 
 * - Purpose: Manages multiple FilterInstance objects based on an array of configuration objects.
 * - Constructor Parameters:
 *   - configs (Array<Object>): An array where each object contains configuration options for a FilterInstance.
 * 
 * FilterInstance Class
 * 
 * - Purpose: Handles the creation of filter buttons and the filtering logic for a set of DOM elements.
 * - Constructor Parameters:
 *   - options (Object): Configuration object with the following properties:
 *     - filterTarget (string, required): CSS selector for the elements to be filtered.
 *     - containerClass (string, required): CSS class for the parent container where filter buttons will be appended.
 *     - buttonDuration (number, optional): Transition duration for filter buttons in milliseconds. Default is 300.
 *     - hiddenClass (string, optional): CSS class to hide elements that do not match the filter. Default is "hidden".
 *     - useAttributeFilter (boolean, optional): If true, filters based on a specific attribute. Default is false.
 *     - filterFunction (function, optional): Custom function to determine if an element matches the filter.
 *     - attributeName (string, required if useAttributeFilter is true): The attribute name used for filtering.
 *     - dynamicList (string, optional): CSS selector for dynamic list elements used in filtering.
 *     - filters (Array<Object>, optional): Array of filter objects. Each object should have a `value` and optionally `text`.
 *     - buttonClass (string, optional): CSS class for the filter buttons.
 *     - buttonActiveClass (string, optional): CSS class for the active filter button.
 * 
 * Private Methods:
 * 
 * - _createButtons():
 *     - Description: Creates and appends filter buttons based on the `filters` array.
 *     - Parameters: None
 *     - Returns: void
 * 
 * - _initFilter():
 *     - Description: Initializes the filter state. Can be extended for additional initialization logic.
 *     - Parameters: None
 *     - Returns: void
 * 
 * - _toggleFilter(filterValue, button):
 *     - Description: Toggles the filter based on the selected value and updates the active button.
 *     - Parameters:
 *         - filterValue (string): The value of the filter to toggle.
 *         - button (HTMLElement): The button element that was clicked.
 *     - Returns: void
 * 
 * - _applyFilter(filterValue):
 *     - Description: Applies the filter to the elements, hiding those that do not match.
 *     - Parameters:
 *         - filterValue (string): The value of the filter to apply.
 *     - Returns: void
 * 
 * - _resetFilter():
 *     - Description: Resets all filters, making all elements visible.
 *     - Parameters: None
 *     - Returns: void
 * 
 * - _updateActiveButton(activeButton):
 *     - Description: Updates the active state of the filter buttons.
 *     - Parameters:
 *         - activeButton (HTMLElement|null): The button to set as active. If null, no button is active.
 *     - Returns: void
 * 
 * Usage Example
 * 
 * ```javascript
 * const filterConfigs = [
 *     {
 *         filterTarget: '.item',
 *         containerClass: '.filter-buttons',
 *         useAttributeFilter: true,
 *         attributeName: 'data-category',
 *         buttonClass: 'filter-btn',
 *         buttonActiveClass: 'active',
 *     },
 *     {
 *         filterTarget: '.product',
 *         containerClass: '.product-filters',
 *         filterFunction: (element, value) => {
 *             return element.dataset.type === value;
 *         },
 *         filters: [
 *             { value: 'electronics', text: 'Electronics' },
 *             { value: 'clothing', text: 'Clothing' },
 *             { value: 'books', text: 'Books' },
 *         ],
 *         buttonClass: 'product-filter-btn',
 *         buttonActiveClass: 'selected',
 *     }
 * ];
 * 
 * const filterManager = new Filter(filterConfigs);
 * ```
 * 
 * In this example:
 * 
 * - The first `FilterInstance` filters elements with the class `.item` based on the `data-category` attribute.
 * - The second `FilterInstance` filters elements with the class `.product` using a custom filter function and predefined filter buttons.
 * 
 * Notes:
 * 
 * - Ensure that the `containerClass` exists in the DOM before initializing the `FilterInstance`.
 * - When using `useAttributeFilter`, the `attributeName` must be provided.
 * - If neither `filterFunction` nor `dynamicList` is provided while `useAttributeFilter` is false, an error will be thrown.
 * - The `filters` array can be auto-generated based on the attributes or dynamic list if not provided.
 * - Custom filter functions should return a boolean indicating whether the element matches the filter criteria.
 */