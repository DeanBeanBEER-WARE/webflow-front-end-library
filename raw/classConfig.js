/**
 * ComboClassConfigurator Class
 * 
 * This class manages the dynamic addition and removal of CSS classes on DOM elements based on various
 * user interactions and scroll events. It allows for flexible configurations, including event-based
 * triggers, threshold-based class manipulations, debounce handling, and more. The class supports
 * both attribute-based pairing and repeat configurations for applying classes to multiple elements.
 * 
 * @version 1.0.0
 * @license MIT
 * 
 * ## Usage
 * 
 * Include this script via a CDN or local file, then instantiate the `ComboClassConfigurator` class
 * with the desired configuration options.
 * 
 * ```javascript
 * const classConfigs = [
 *     {
 *         eventName: "click",
 *         parentElement: "parent-1",
 *         triggerElement: "trigger-1",
 *         addClasses: ["active"],
 *         removeClasses: ["inactive"],
 *         callback: (element, action) => {
 *             console.log(`Element ${element.id} had classes ${action}`);
 *         }
 *     },
 *     {
 *         eventName: "hover",
 *         parentElement: ".parent-class",
 *         triggerElement: ".trigger-class",
 *         addClasses: ["hovered"],
 *         removeClasses: ["not-hovered"],
 *         switchAction: true
 *     },
 *     {
 *         eventName: "scrollInView",
 *         parentAttribut: "data-parent",
 *         triggerAttribut: "data-trigger",
 *         entryThreshold: 50,
 *         exitThreshold: 25,
 *         addClasses: ["visible"],
 *         removeClasses: ["hidden"],
 *         once: true
 *     }
 * ];
 * 
 * // Initialize the ComboClassConfigurator with the provided configurations
 * const configurator = new ComboClassConfigurator(classConfigs);
 * ```
 * 
 * ## Configuration Options
 * 
 * Each configuration object within the `configs` array can have the following properties:
 * 
 * | Property              | Type                | Description                                                                                                 |
 * |-----------------------|---------------------|-------------------------------------------------------------------------------------------------------------|
 * | `eventName`           | `string`            | The type of event to listen for. Possible values: `"click"`, `"hover"`, `"scrollInView"`.                   |
 * | `transitionTime`      | `string`            | The CSS transition time (e.g., `"0.5s"`). Default is `"0s"`.                                                |
 * | `removeTransitionTime`| `string|null`       | The CSS transition time when removing classes. If `null`, defaults to `transitionTime`.                     |
 * | `easingMode`          | `string`            | The CSS easing function. Possible values: `"ease"`, `"ease-in"`, `"ease-out"`, `"ease-in-out"`.             |
 * | `entryThreshold`      | `number`            | The percentage threshold for scroll events to trigger class addition. Must be between 0 and 100.            |
 * | `exitThreshold`       | `number|null`       | The percentage threshold for scroll events to trigger class removal. Must be between 0 and 100.             |
 * | `parentElement`       | `string|HTMLElement`| The selector or reference to the parent element containing target elements.                                 |
 * | `triggerElement`      | `string|HTMLElement`| The selector or reference to the element that triggers the event.                                           |
 * | `once`                | `boolean`           | If `true`, the event listener will be removed after the first trigger. Default is `false`.                  |
 * | `debounce`            | `number`            | The debounce delay in milliseconds for event handling. Default is `0`.                                      |
 * | `switchAction`        | `boolean`           | If `true`, toggles between adding and removing classes on events. Default is `false`.                       |
 * | `repeatConfiguration` | `number`            | The number of times to repeat the configuration for multiple elements. Must be >= 1. Default is `1`.        |
 * | `triggerAttribut`     | `string`            | The attribute name used for pairing trigger elements.                                                       |
 * | `parentAttribut`      | `string`            | The attribute name used for pairing parent elements.                                                        |
 * | `callback`            | `Function|null`     | A callback function executed after classes are added or removed.                                            |
 * | `classesAdded`        | `boolean`           | Internal flag indicating if classes have been added. Default is `false`.                                    |
 * | `start`               | `number`            | The starting index for class manipulation. Default is `1`.                                                  |
 * | `end`                 | `number`            | The ending index for class manipulation. Default is `0` (no end).                                           |
 * | `frequency`           | `number`            | The frequency at which classes are added or removed. Default is `1`.                                        |
 * | `addClasses`          | `Array<string>`     | Array of class names to add to target elements.                                                             |
 * | `removeClasses`       | `Array<string>`     | Array of class names to remove from target elements.                                                        |
 * | `topAddClasses`       | `Array<string>`     | Array of class names to add at the top level, affecting multiple elements.                                  |
 * 
 * ### Notes
 * 
 * - When using attribute-based pairing (`triggerAttribut` and `parentAttribut`), elements must have the corresponding attributes with matching values to establish the pairing.
 * - The `debounce` parameter helps in controlling the frequency of class manipulations, especially useful for events that can fire rapidly like scroll or resize.
 * - The `callback` function, if provided, is executed after classes are added or removed, allowing for additional custom behavior.
 * - The `once` parameter ensures that certain class manipulations occur only once, useful for animations or one-time effects.
 * - Ensure that the provided selectors or IDs (`parentElement`, `triggerElement`) exist in the DOM.
 * 
 * ## Methods
 * 
 * | Method                            | Description                                                                                                           |
 * |-----------------------------------|-----------------------------------------------------------------------------------------------------------------------|
 * | `constructor(configs)`            | Initializes the class with the provided configurations and sets up the necessary observers and listeners.             |
 * | `setup()`                         | Merges default settings with user configurations, validates parameters, and processes each configuration.             |
 * | `_validateThreshold()`            | Validates that a threshold value is a number between 0 and 100.                                                       |
 * | `_cleanClasses()`                 | Cleans an array of class names by removing dots, trimming whitespace, and filtering out empty strings.                |
 * | `_processAttributeBasedPairing()` | Processes configurations based on attribute-based pairing between parent and trigger elements.                        |
 * | `_mapElementsByAttribute()`       | Maps DOM elements by a specific attribute value.                                                                      |
 * | `_processRepeatConfiguration()`   | Processes configurations that require repeating based on the repeatConfiguration value.                               |
 * | `initEventListeners()`            | Initializes event listeners for each class configuration based on the specified event types.                          |
 * | `_calculateThresholds()`          | Calculates and normalizes the entry and exit thresholds.                                                              |
 * | `_initClasses()`                  | Initializes classes on target elements by adding or removing specified classes.                                       |
 * | `_handleClick()`                  | Handles click events by toggling classes based on the current state.                                                  |
 * | `_handleHover()`                  | Handles hover events by adding or removing classes on mouse enter and leave.                                          |
 * | `_handleScrollInView()`           | Handles scroll-in-view events by observing elements entering or exiting the viewport.                                 |
 * | `_applyImmediateClasses()`        | Applies classes immediately based on the configuration without waiting for events.                                    |
 * 
 * ## Example
 * 
 * ```javascript
 * const classConfigs = [
 *     {
 *         eventName: "click",
 *         parentElement: "parent-1",
 *         triggerElement: "trigger-1",
 *         addClasses: ["active"],
 *         removeClasses: ["inactive"],
 *         callback: (element, action) => {
 *             console.log(`Element ${element.id} had classes ${action}`);
 *         }
 *     },
 *     {
 *         eventName: "hover",
 *         parentElement: ".parent-class",
 *         triggerElement: ".trigger-class",
 *         addClasses: ["hovered"],
 *         removeClasses: ["not-hovered"],
 *         switchAction: true
 *     },
 *     {
 *         eventName: "scrollInView",
 *         parentAttribut: "data-parent",
 *         triggerAttribut: "data-trigger",
 *         entryThreshold: 50,
 *         exitThreshold: 25,
 *         addClasses: ["visible"],
 *         removeClasses: ["hidden"],
 *         once: true
 *     }
 * ];
 * 
 * // Initialize the ComboClassConfigurator with the provided configurations
 * const configurator = new ComboClassConfigurator(classConfigs);
 * ```
 * 
 * In this example:
 * 
 * - The first configuration adds the "active" class and removes the "inactive" class when the element with ID "trigger-1" is clicked. A callback logs the action.
 * - The second configuration toggles the "hovered" and "not-hovered" classes on elements with the class "trigger-class" when hovered, allowing for switching actions.
 * - The third configuration adds the "visible" class and removes the "hidden" class when elements with the attribute "data-trigger" paired with their respective parents (having "data-parent") enter the viewport at a 50% threshold and exit at a 25% threshold. The `once` flag ensures the observer is disconnected after the first trigger.
 */

class ComboClassConfigurator {
    /**
     * Constructs a new ComboClassConfigurator instance.
     * 
     * @param {Array<Object>} configs - An array of configuration objects for class manipulation.
     * @throws {Error} Throws an error if the provided configurations are not an array.
     */
    constructor(configs) {
        // Validate that the provided configurations are an array
        if (Array.isArray(configs)) {
            this.initialConfigs = configs;
        } else {
            throw new Error("Invalid classConfigs parameter. An array is expected.");
        }

        /**
         * @type {Array<Object>}
         * @description Array to hold processed class configuration objects.
         */
        this.classConfigs = [];

        /**
         * @type {Map<string, IntersectionObserver>}
         * @description Map to store IntersectionObserver instances keyed by their configuration.
         */
        this.scrollObservers = new Map();

        // Initialize setup when the DOM is ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Sets up the class configurations by merging default settings with user-provided configurations,
     * validating parameters, and processing each configuration accordingly.
     * 
     * @private
     */
    setup() {
        // Define supported easing modes
        const supportedEasings = ["ease", "ease-in", "ease-out", "ease-in-out"];

        // Define default configuration values
        const defaultConfig = {
            eventName: "click",
            transitionTime: "0s",
            removeTransitionTime: null,
            easingMode: "ease",
            entryThreshold: 0,
            exitThreshold: null,
            parentElement: "",
            triggerElement: "",
            once: false,
            debounce: 0,
            switchAction: false,
            repeatConfiguration: 1,
            triggerAttribut: "",
            parentAttribut: "",
            callback: null,
            classesAdded: false,
            start: 1,
            end: 0,
            frequency: 1,
            addClasses: [],
            removeClasses: [],
            topAddClasses: []
        };

        // Iterate over each initial configuration
        this.initialConfigs.forEach(config => {
            // Merge user config with default config
            const mergedConfig = {
                ...defaultConfig,
                ...config
            };

            // Validate and set easing mode
            mergedConfig.easingMode = supportedEasings.includes(mergedConfig.easingMode)
                ? mergedConfig.easingMode
                : defaultConfig.easingMode;

            // Validate threshold values
            mergedConfig.entryThreshold = this._validateThreshold(
                mergedConfig.entryThreshold,
                defaultConfig.entryThreshold
            );
            mergedConfig.exitThreshold = this._validateThreshold(
                mergedConfig.exitThreshold,
                defaultConfig.exitThreshold
            );

            // Clean class lists by removing dots and trimming whitespace
            mergedConfig.addClasses = this._cleanClasses(mergedConfig.addClasses);
            mergedConfig.removeClasses = this._cleanClasses(mergedConfig.removeClasses);
            mergedConfig.topAddClasses = this._cleanClasses(mergedConfig.topAddClasses);

            // Ensure repeatConfiguration is a positive integer
            const repeatCount =
                typeof mergedConfig.repeatConfiguration === "number" && mergedConfig.repeatConfiguration >= 1
                    ? Math.floor(mergedConfig.repeatConfiguration)
                    : 1;

            // Handle special cases when topAddClasses are defined
            if (mergedConfig.topAddClasses.length > 0) {
                if (mergedConfig.removeClasses.length > 0) {
                    console.warn(
                        `'removeClasses' should not be defined when 'topAddClasses' is set. It will be ignored.`
                    );
                    mergedConfig.removeClasses = [];
                }
                if (mergedConfig.switchAction) {
                    console.warn(
                        `'switchAction' should not be defined when 'topAddClasses' is set. It will be set to false.`
                    );
                    mergedConfig.switchAction = false;
                }
            }

            // Process the configuration based on attribute pairing or repeat configuration
            if (mergedConfig.triggerAttribut && mergedConfig.parentAttribut) {
                this._processAttributeBasedPairing(mergedConfig);
            } else {
                this._processRepeatConfiguration(mergedConfig, repeatCount);
            }
        });

        // Initialize event listeners based on processed configurations
        this.initEventListeners();
    }

    /**
     * Validates the threshold value ensuring it is a number between 0 and 100.
     * 
     * @param {number} value - The threshold value to validate.
     * @param {number} defaultValue - The default value to use if validation fails.
     * @returns {number} - The validated threshold value.
     * @private
     */
    _validateThreshold(value, defaultValue) {
        return typeof value === "number" && value >= 0 && value <= 100 ? value : defaultValue;
    }

    /**
     * Cleans an array of class names by removing dots, trimming whitespace, and filtering out empty strings.
     * 
     * @param {Array<string>} classes - The array of class names to clean.
     * @returns {Array<string>} - The cleaned array of class names.
     * @private
     */
    _cleanClasses(classes) {
        return Array.isArray(classes)
            ? classes.map(cls => cls.replace(".", "").trim()).filter(Boolean)
            : [];
    }

    /**
     * Processes configurations that are based on attribute-based pairing between parent and trigger elements.
     * 
     * @param {Object} config - The merged configuration object.
     * @private
     */
    _processAttributeBasedPairing(config) {
        // Select all parent and trigger elements based on their attributes
        const parentElements = document.querySelectorAll(`[${config.parentAttribut}]`);
        const triggerElements = document.querySelectorAll(`[${config.triggerAttribut}]`);

        // Map elements by their attribute values
        const parentMap = this._mapElementsByAttribute(parentElements, config.parentAttribut);
        const triggerMap = this._mapElementsByAttribute(triggerElements, config.triggerAttribut);

        // Pair parent and trigger elements based on matching attribute values
        parentMap.forEach((parents, attrValue) => {
            if (triggerMap.has(attrValue)) {
                const triggers = triggerMap.get(attrValue);
                parents.forEach(parent => {
                    triggers.forEach(trigger => {
                        this.classConfigs.push({
                            ...config,
                            parentElement: parent,
                            triggerElement: trigger,
                            repeatConfiguration: 1,
                            triggerAttribut: "",
                            parentAttribut: ""
                        });
                    });
                });
            }
        });
    }

    /**
     * Maps DOM elements by a specific attribute value.
     * 
     * @param {NodeListOf<Element>} elements - The list of elements to map.
     * @param {string} attribute - The attribute to map elements by.
     * @returns {Map<string, Array<Element>>} - A map of attribute values to arrays of elements.
     * @private
     */
    _mapElementsByAttribute(elements, attribute) {
        const map = new Map();
        elements.forEach(element => {
            const attrValue = element.getAttribute(attribute).trim();
            if (attrValue) {
                if (map.has(attrValue)) {
                    map.get(attrValue).push(element);
                } else {
                    map.set(attrValue, [element]);
                }
            }
        });
        return map;
    }

    /**
     * Processes configurations that require repeating based on the repeatConfiguration value.
     * 
     * @param {Object} config - The merged configuration object.
     * @param {number} repeatCount - The number of times to repeat the configuration.
     * @private
     */
    _processRepeatConfiguration(config, repeatCount) {
        for (let i = 1; i <= repeatCount; i++) {
            const suffix = i === 1 ? "" : `-${i}`;
            const appendSuffix = str => (str ? (str.endsWith(suffix) ? str : `${str}${suffix}`) : "");

            const parentElement = appendSuffix(config.parentElement);
            const triggerElement = appendSuffix(config.triggerElement);

            this.classConfigs.push({
                ...config,
                parentElement: parentElement,
                triggerElement: triggerElement,
                repeatConfiguration: 1
            });
        }
    }

    /**
     * Initializes event listeners for each class configuration based on the specified event types.
     * 
     * @private
     */
    initEventListeners() {
        /**
         * Helper function to select an element by selector or ID.
         * 
         * @param {string} selectorOrId - The CSS selector or ID of the element.
         * @returns {HTMLElement|null} - The selected element or null if not found.
         */
        const getElement = selectorOrId => {
            if (!selectorOrId) return null;
            return selectorOrId.startsWith(".")
                ? document.querySelector(selectorOrId)
                : document.getElementById(selectorOrId);
        };

        /**
         * Creates a debounced version of a function using requestAnimationFrame and setTimeout.
         * 
         * @param {Function} func - The function to debounce.
         * @param {number} delay - The debounce delay in milliseconds.
         * @returns {Function} - The debounced function.
         */
        const debounceHandler = (func, delay = 0) => {
            let rafId = null;
            let timeoutId = null;
            let argsCache = null;

            const callback = () => {
                rafId = null;
                func(...argsCache);
                argsCache = null;
            };

            return function(...args) {
                argsCache = args;
                if (rafId === null) {
                    rafId = requestAnimationFrame(callback);
                }
                if (delay > 0) {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        if (rafId !== null) {
                            cancelAnimationFrame(rafId);
                            rafId = null;
                        }
                        func(...argsCache);
                        argsCache = null;
                    }, delay);
                }
            };
        };

        /**
         * Maps event names to their corresponding handler functions.
         */
        const eventHandlers = new Map([
            ["click", this._handleClick.bind(this)],
            ["hover", this._handleHover.bind(this)],
            ["scrollInView", this._handleScrollInView.bind(this)]
        ]);

        // Iterate over each class configuration to set up event listeners
        this.classConfigs.forEach(config => {
            const {
                eventName,
                entryThreshold,
                exitThreshold,
                debounce: debounceDelay,
                once,
                switchAction,
                topAddClasses
            } = config;

            let triggerElement = null;

            // Select the trigger element based on the configuration
            if (config.triggerElement) {
                triggerElement =
                    config.triggerElement instanceof Element
                        ? config.triggerElement
                        : getElement(config.triggerElement);
            }

            // If the trigger element is specified but not found, skip this configuration
            if (config.triggerElement && !triggerElement) return;

            /**
             * Creates a debounced function for adding classes.
             */
            const addClassesDebounced = debounceHandler(
                () => {
                    if (!config.once || !config.classesAdded) {
                        this._initClasses(config, "add");
                        config.classesAdded = true;
                        if (config.callback) {
                            config.callback(triggerElement || null, "add");
                        }
                    }
                },
                debounceDelay
            );

            /**
             * Creates a debounced function for removing classes.
             */
            const removeClassesDebounced = debounceHandler(
                () => {
                    if (!once) {
                        this._initClasses(config, "remove");
                        config.classesAdded = false;
                        if (config.callback) {
                            config.callback(triggerElement || null, "remove");
                        }
                    }
                },
                debounceDelay
            );

            // Get the appropriate handler based on the event name
            const handler = eventHandlers.get(eventName);

            if (handler) {
                handler(triggerElement, config, addClassesDebounced, removeClassesDebounced, this._calculateThresholds(entryThreshold, exitThreshold));
            } else {
                // If no handler is found for the event, apply classes immediately
                this._applyImmediateClasses(config);
            }
        });
    }

    /**
     * Calculates and normalizes the entry and exit thresholds.
     * 
     * @param {number} entry - The entry threshold percentage.
     * @param {number|null} exit - The exit threshold percentage.
     * @returns {Array<number>} - An array containing normalized entry and exit thresholds.
     * @private
     */
    _calculateThresholds(entry, exit) {
        const thresholds = new Set();
        thresholds.add(entry / 100);
        if (exit !== null) {
            thresholds.add(exit / 100);
        }
        return Array.from(thresholds);
    }

    /**
     * Initializes classes on target elements by adding or removing specified classes.
     * 
     * @param {Object} config - The class configuration object.
     * @param {string} action - The action to perform ("add" or "remove").
     * @private
     */
    _initClasses(config, action) {
        const {
            targetClass,
            addClasses,
            removeClasses,
            topAddClasses,
            frequency,
            start,
            end,
            transitionTime,
            removeTransitionTime,
            easingMode
        } = config;

        // Calculate the range of elements to affect based on start, end, and frequency
        const startIndex = start - 1;
        const endIndex = end === 0 ? Infinity : end - 1;

        // Determine the transition timing
        const transition = action === "remove" && removeTransitionTime ? removeTransitionTime : transitionTime;

        // Select the parent element; default to document if not specified
        let parent = document;
        if (config.parentElement) {
            parent = typeof config.parentElement === "string" ? getElement(config.parentElement) || document : config.parentElement;
        }

        // Select all target elements within the parent
        const targets = parent.querySelectorAll(targetClass);

        // Iterate over each target element to apply or remove classes
        targets.forEach((element, index) => {
            if (index >= startIndex && index <= endIndex && (index - startIndex) % frequency === 0) {
                // Set the transition style
                element.style.transition = `all ${transition} ${easingMode}`;

                // Use requestAnimationFrame to ensure the transition is applied
                requestAnimationFrame(() => {
                    if (action === "remove") {
                        if (config.topAddClasses.length > 0) {
                            element.classList.remove(...config.topAddClasses, ...config.addClasses);
                        } else {
                            element.classList.remove(...removeClasses);
                        }
                    } else if (action === "add") {
                        if (config.topAddClasses.length > 0) {
                            const rect = element.getBoundingClientRect();
                            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                            if (rect.bottom < 0) {
                                element.classList.add(...config.topAddClasses);
                                element.classList.remove(...config.addClasses);
                            } else if (rect.top > viewportHeight) {
                                element.classList.add(...addClasses);
                                element.classList.remove(...config.topAddClasses);
                            }
                        } else {
                            element.classList.add(...addClasses);
                        }
                    }

                    // Execute the callback if provided
                    if (config.callback) {
                        config.callback(element, action);
                    }
                });
            }
        });
    }

    /**
     * Handles click events by toggling classes based on the current state.
     * 
     * @param {HTMLElement} element - The trigger element that was clicked.
     * @param {Object} config - The class configuration object.
     * @param {Function} addCallback - The debounced function to add classes.
     * @param {Function} removeCallback - The debounced function to remove classes.
     * @param {Array<number>} thresholds - The entry and exit thresholds.
     * @private
     */
    _handleClick(element, config, addCallback, removeCallback, thresholds) {
        element.addEventListener("click", () => {
            const action = config.classesAdded ? "remove" : "add";
            if (action === "add") {
                addCallback();
            } else {
                removeCallback();
            }
            config.classesAdded = !config.classesAdded;
            if (config.callback) {
                config.callback(element, action);
            }
        });
    }

    /**
     * Handles hover events by adding or removing classes on mouse enter and leave.
     * 
     * @param {HTMLElement} element - The trigger element being hovered.
     * @param {Object} config - The class configuration object.
     * @param {Function} addCallback - The debounced function to add classes.
     * @param {Function} removeCallback - The debounced function to remove classes.
     * @param {Array<number>} thresholds - The entry and exit thresholds.
     * @private
     */
    _handleHover(element, config, addCallback, removeCallback, thresholds) {
        if (config.switchAction) {
            element.addEventListener("mouseenter", removeCallback);
            element.addEventListener("mouseleave", addCallback);
        } else {
            element.addEventListener("mouseenter", addCallback);
            element.addEventListener("mouseleave", removeCallback);
        }
    }

    /**
     * Handles scroll-in-view events by observing elements entering or exiting the viewport.
     * 
     * @param {HTMLElement} element - The element being observed for scroll events.
     * @param {Object} config - The class configuration object.
     * @param {Function} addCallback - The debounced function to add classes.
     * @param {Function} removeCallback - The debounced function to remove classes.
     * @param {Array<number>} thresholds - The entry and exit thresholds.
     * @private
     */
    _handleScrollInView(element, config, addCallback, removeCallback, thresholds) {
        const observerConfig = JSON.stringify({
            threshold: thresholds.sort(),
            root: null,
            rootMargin: "0px"
        });

        let observer = this.scrollObservers.get(observerConfig);

        // Create a new IntersectionObserver if one doesn't exist for the current configuration
        if (!observer) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    const target = entry.target;
                    const configs = target.__comboClassConfigs || [];

                    configs.forEach(conf => {
                        const {
                            switchAction,
                            entryThreshold,
                            exitThreshold,
                            debouncedInit,
                            debouncedRemove,
                            topAddClasses
                        } = conf;

                        const ratio = entry.intersectionRatio;

                        if (topAddClasses.length > 0) {
                            const rect = target.getBoundingClientRect();
                            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                            if (rect.bottom < 0) {
                                debouncedInit();
                            } else if (rect.top > viewportHeight) {
                                debouncedRemove();
                            }
                        } else if (switchAction) {
                            if (ratio >= entryThreshold / 100) {
                                debouncedRemove();
                            }
                            if (exitThreshold !== null && ratio < exitThreshold / 100) {
                                debouncedInit();
                            }
                        } else {
                            if (ratio >= entryThreshold / 100) {
                                debouncedInit();
                            }
                            if (exitThreshold !== null && ratio < exitThreshold / 100) {
                                debouncedRemove();
                            }
                        }
                    });
                });
            }, {
                threshold: thresholds
            });

            // Store the observer for future use
            this.scrollObservers.set(observerConfig, observer);
        }

        // Initialize the __comboClassConfigs property on the element if not already present
        if (!element.__comboClassConfigs) {
            element.__comboClassConfigs = [];
            observer.observe(element);
        }

        // Add the current configuration to the element's config list
        element.__comboClassConfigs.push({
            ...config,
            debouncedInit: addCallback,
            debouncedRemove: removeCallback
        });

        // If the configuration is set to execute only once, modify the callback to unobserve after execution
        if (config.once) {
            const originalCallback = config.callback;
            config.callback = (el, action) => {
                if (originalCallback) originalCallback(el, action);
                if (action === "remove") {
                    observer.unobserve(el);
                    const index = el.__comboClassConfigs.indexOf(config);
                    if (index > -1) {
                        el.__comboClassConfigs.splice(index, 1);
                    }
                }
            };
        }
    }

    /**
     * Applies classes immediately based on the configuration without waiting for events.
     * 
     * @param {Object} config - The class configuration object.
     * @private
     */
    _applyImmediateClasses(config) {
        if (config.topAddClasses.length > 0) {
            this._initClasses(config, "add");
            config.classesAdded = true;
        } else if (config.addClasses.length > 0) {
            this._initClasses(config, "add");
            config.classesAdded = true;
        }

        if (config.removeClasses.length > 0) {
            this._initClasses(config, "remove");
            config.classesAdded = false;
        }
    }
}

/**
 * Helper function to select an element by selector or ID.
 * 
 * @param {string} selectorOrId - The CSS selector or ID of the element.
 * @returns {HTMLElement|null} - The selected element or null if not found.
 */
function getElement(selectorOrId) {
    if (!selectorOrId) return null;
    return selectorOrId.startsWith(".")
        ? document.querySelector(selectorOrId)
        : document.getElementById(selectorOrId);
}

// Expose the ComboClassConfigurator class to the global window object for external access
window.ComboClassConfigurator = ComboClassConfigurator;