/**
 * ComboClassConfigurator Class
 *
 * Manages dynamic addition and removal of CSS classes on DOM elements based on user interactions.
 * This class provides a flexible way to handle various user interactions like clicks, hovers, and scroll events,
 * allowing for dynamic class manipulation on DOM elements.
 *
 * Options (for each configuration):
 * - eventName (string): The event to listen for (e.g., "click").
 * - transitionTime (string): Duration of the transition (default: "0s").
 * - removeTransitionTime (string|null): Transition duration when removing classes.
 * - easingMode (string): CSS easing function (default: "ease").
 * - entryThreshold (number): Percentage (0-100) at which classes are added (default: 0).
 * - exitThreshold (number|null): Percentage (0-100) at which classes are removed.
 * - parentElement (string|HTMLElement): Selector or element for the container of target elements.
 * - triggerElement (string|HTMLElement): Selector or element that triggers the event.
 * - once (boolean): If true, the event listener is removed after the first trigger (default: false).
 * - debounce (number): Delay in ms for debouncing (default: 0).
 * - switchAction (boolean): If true, toggles between adding and removing classes (default: false).
 * - repeatConfiguration (number): Number of times to repeat the configuration (default: 1).
 * - triggerAttribut (string): Attribute name for pairing trigger elements.
 * - parentAttribute (string): Attribute name for pairing parent elements.
 * - callback (Function|null): Callback executed after classes are added/removed.
 * - addClasses (Array<string>): Classes to add.
 * - removeClasses (Array<string>): Classes to remove.
 * - topAddClasses (Array<string>): Classes to add auf oberster Ebene.
 *
 * Example instantiation (asynchron sicher):
 * window.addEventListener('DOMContentLoaded', () => {
 *   const classConfigs = [
 *     {
 *       eventName: "click",
 *       parentElement: ".parent-container",
 *       triggerElement: ".trigger-btn",
 *       addClasses: ["active"],
 *       removeClasses: ["inactive"],
 *       callback: (element, action) => console.log(`Element ${element.id} ${action}`)
 *     }
 *   ];
 *   const configurator = new ComboClassConfigurator(classConfigs);
 * });
 *
 * @version 1.0.0
 * @license MIT
 */
(function() {
    class ComboClassConfigurator {
        constructor(configs) {
            Array.isArray(configs)
                ? (this.initialConfigs = configs)
                : (() => { throw new Error("Invalid classConfigs parameter. An array is expected."); })();
        
            this.classConfigs = [];
            this.scrollObservers = new Map();
        
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => this.setup());
            } else {
                this.setup();
            }
        }
        
        setup() {
            this.initialConfigs.forEach(config => {
                const mergedConfig = { ...window.defaultConfig, ...config };
                mergedConfig.easingMode = window.supportedEasings.includes(mergedConfig.easingMode)
                    ? mergedConfig.easingMode
                    : window.defaultConfig.easingMode;
                mergedConfig.entryThreshold = this._validateThreshold(mergedConfig.entryThreshold, window.defaultConfig.entryThreshold);
                mergedConfig.exitThreshold = this._validateThreshold(mergedConfig.exitThreshold, window.defaultConfig.exitThreshold);
                mergedConfig.addClasses = this._cleanClasses(mergedConfig.addClasses);
                mergedConfig.removeClasses = this._cleanClasses(mergedConfig.removeClasses);
                mergedConfig.topAddClasses = this._cleanClasses(mergedConfig.topAddClasses);
        
                const repeatCount = (typeof mergedConfig.repeatConfiguration === "number" && mergedConfig.repeatConfiguration >= 1)
                    ? Math.floor(mergedConfig.repeatConfiguration)
                    : 1;
        
                if (mergedConfig.topAddClasses.length > 0) {
                    if (mergedConfig.removeClasses.length > 0) {
                        console.warn(`'removeClasses' should not be defined when 'topAddClasses' is set. It will be ignored.`);
                        mergedConfig.removeClasses = [];
                    }
                    if (mergedConfig.switchAction) {
                        console.warn(`'switchAction' should not be defined when 'topAddClasses' is set. It will be set to false.`);
                        mergedConfig.switchAction = false;
                    }
                }
        
                if (mergedConfig.triggerAttribut && mergedConfig.parentAttribute) {
                    this._processAttributeBasedPairing(mergedConfig);
                } else {
                    this._processRepeatConfiguration(mergedConfig, repeatCount);
                }
            });
        
            this.initEventListeners();
        }
        
        /**
         * Validates the threshold value.
         * Ensures the threshold is a valid number between 0 and 100.
         * @param {number} value - The threshold value to validate.
         * @param {number} defaultValue - The default value to use if validation fails.
         * @returns {number} The validated threshold value.
         * @private
         */
        _validateThreshold(value, defaultValue) {
            if (typeof value !== "number") {
                console.warn(`Invalid threshold value: ${value}. Expected a number. Using default value: ${defaultValue}`);
                return defaultValue;
            }
            if (value < 0 || value > 100) {
                console.warn(`Threshold value ${value} is out of range. Expected a value between 0 and 100. Using default value: ${defaultValue}`);
                return defaultValue;
            }
            return value;
        }
        
        /**
         * Cleans the classes array.
         * Removes dots and trims whitespace from class names.
         * @param {Array<string>} classes - The classes to clean.
         * @returns {Array<string>} The cleaned classes array.
         * @private
         */
        _cleanClasses(classes) {
            return Array.isArray(classes)
                ? classes.map(cls => cls.replace(".", "").trim()).filter(Boolean)
                : [];
        }
        
        /**
         * Processes attribute-based pairing of elements.
         * Pairs parent and trigger elements based on matching attribute values.
         * @param {Object} config - The configuration object.
         * @private
         */
        _processAttributeBasedPairing(config) {
            const parentElements = document.querySelectorAll(`[${config.parentAttribute}]`);
            const triggerElements = document.querySelectorAll(`[${config.triggerAttribut}]`);
            const parentMap = this._mapElementsByAttribute(parentElements, config.parentAttribute);
            const triggerMap = this._mapElementsByAttribute(triggerElements, config.triggerAttribut);
        
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
                                parentAttribute: ""
                            });
                        });
                    });
                }
            });
        }
        
        /**
         * Maps elements by attribute.
         * Creates a map of elements grouped by their attribute values.
         * @param {NodeList} elements - The elements to map.
         * @param {string} attribute - The attribute to map by.
         * @returns {Map} The mapped elements.
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
         * Processes repeat configuration.
         * Creates multiple configurations based on the repeat count.
         * @param {Object} config - The configuration object.
         * @param {number} repeatCount - The number of times to repeat the configuration.
         * @private
         */
        _processRepeatConfiguration(config, repeatCount) {
            if (repeatCount < 1) {
                console.warn(`Invalid repeat count: ${repeatCount}. Using default value: 1`);
                repeatCount = 1;
            }

            for (let i = 1; i <= repeatCount; i++) {
                const suffix = i === 1 ? "" : `-${i}`;
                const appendSuffix = str => {
                    if (!str) return "";
                    if (typeof str !== "string") {
                        console.warn(`Invalid element selector: ${str}. Expected a string.`);
                        return "";
                    }
                    return str.endsWith(suffix) ? str : `${str}${suffix}`;
                };
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
         * Initializes event listeners.
         * Sets up event listeners for each configuration.
         * @private
         */
        initEventListeners() {
            const getElement = selectorOrId => {
                if (!selectorOrId) return null;
                return selectorOrId.startsWith(".")
                    ? document.querySelector(selectorOrId)
                    : document.getElementById(selectorOrId);
            };
        
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
        
            const eventHandlers = new Map([
                ["click", this._handleClick.bind(this)],
                ["hover", this._handleHover.bind(this)],
                ["scrollInView", this._handleScrollInView.bind(this)]
            ]);
        
            this.classConfigs.forEach(config => {
                const { eventName, entryThreshold, exitThreshold, debounce: debounceDelay, once, switchAction, topAddClasses } = config;
                let triggerElement = null;
                if (config.triggerElement) {
                    triggerElement = (config.triggerElement instanceof Element)
                        ? config.triggerElement
                        : getElement(config.triggerElement);
                }
                if (config.triggerElement && !triggerElement) return;
        
                const addClassesDebounced = debounceHandler(() => {
                    if (!config.once || !config.classesAdded) {
                        this._initClasses(config, "add");
                        config.classesAdded = true;
                        if (config.callback) {
                            config.callback(triggerElement || null, "add");
                        }
                    }
                }, debounceDelay);
        
                const removeClassesDebounced = debounceHandler(() => {
                    if (!config.once || config.classesAdded) {
                        this._initClasses(config, "remove");
                        config.classesAdded = false;
                        if (config.callback) {
                            config.callback(triggerElement || null, "remove");
                        }
                    }
                }, debounceDelay);
        
                const eventHandler = eventHandlers.get(eventName);
                if (eventHandler) {
                    eventHandler(triggerElement, config, addClassesDebounced, removeClassesDebounced);
                }
            });
        }
        
        /**
         * Handles click events.
         * Adds or removes classes based on the click event.
         * @param {HTMLElement} triggerElement - The element that triggers the event.
         * @param {Object} config - The configuration object.
         * @param {Function} addClassesDebounced - The debounced function to add classes.
         * @param {Function} removeClassesDebounced - The debounced function to remove classes.
         * @private
         */
        _handleClick(triggerElement, config, addClassesDebounced, removeClassesDebounced) {
            triggerElement.addEventListener("click", () => {
                if (config.switchAction) {
                    if (config.classesAdded) {
                        removeClassesDebounced();
                    } else {
                        addClassesDebounced();
                    }
                } else {
                    addClassesDebounced();
                }
            });
        }
        
        /**
         * Handles hover events.
         * Adds or removes classes based on the hover event.
         * @param {HTMLElement} triggerElement - The element that triggers the event.
         * @param {Object} config - The configuration object.
         * @param {Function} addClassesDebounced - The debounced function to add classes.
         * @param {Function} removeClassesDebounced - The debounced function to remove classes.
         * @private
         */
        _handleHover(triggerElement, config, addClassesDebounced, removeClassesDebounced) {
            triggerElement.addEventListener("mouseenter", addClassesDebounced);
            triggerElement.addEventListener("mouseleave", removeClassesDebounced);
        }
        
        /**
         * Handles scroll in view events.
         * Adds or removes classes based on the scroll event.
         * @param {HTMLElement} triggerElement - The element that triggers the event.
         * @param {Object} config - The configuration object.
         * @param {Function} addClassesDebounced - The debounced function to add classes.
         * @param {Function} removeClassesDebounced - The debounced function to remove classes.
         * @private
         */
        _handleScrollInView(triggerElement, config, addClassesDebounced, removeClassesDebounced) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            addClassesDebounced();
                        } else if (config.exitThreshold !== null) {
                            removeClassesDebounced();
                        }
                    });
                },
                {
                    threshold: [config.entryThreshold / 100, config.exitThreshold / 100]
                }
            );
            observer.observe(triggerElement);
            this.scrollObservers.set(triggerElement, observer);
        }
        
        _calculateThresholds(entry, exit) {
            const thresholds = new Set();
            thresholds.add(entry / 100);
            if (exit !== null) {
                thresholds.add(exit / 100);
            }
            return Array.from(thresholds);
        }
        
        _initClasses(config, action) {
            const { targetClass, addClasses, removeClasses, topAddClasses, frequency, start, end, transitionTime, removeTransitionTime, easingMode } = config;
            const startIndex = start - 1;
            const endIndex = end === 0 ? Infinity : end - 1;
            const transition = action === "remove" && removeTransitionTime ? removeTransitionTime : transitionTime;
            const parent = config.parentElement ? (typeof config.parentElement === "string" ? getElement(config.parentElement) || document : config.parentElement) : document;
            const targets = parent.querySelectorAll(targetClass);
        
            targets.forEach((element, index) => {
                if (index >= startIndex && index <= endIndex && ((index - startIndex) % frequency === 0)) {
                    element.style.transition = `all ${transition} ${easingMode}`;
                    requestAnimationFrame(() => {
                        if (action === "remove") {
                            if (topAddClasses.length > 0) {
                                element.classList.remove(...topAddClasses, ...addClasses);
                            } else {
                                element.classList.remove(...removeClasses);
                            }
                        } else {
                            if (topAddClasses.length > 0) {
                                const rect = element.getBoundingClientRect();
                                const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                                if (rect.bottom < 0) {
                                    element.classList.add(...topAddClasses);
                                    element.classList.remove(...addClasses);
                                } else if (rect.top > viewportHeight) {
                                    element.classList.add(...addClasses);
                                    element.classList.remove(...topAddClasses);
                                }
                            } else {
                                element.classList.add(...addClasses);
                            }
                        }
                        if (config.callback) {
                            config.callback(element, action);
                        }
                    });
                }
            });
        }
        
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

    // Exportiere die Klasse ins globale Window-Objekt
    window.ComboClassConfigurator = ComboClassConfigurator;
})();
