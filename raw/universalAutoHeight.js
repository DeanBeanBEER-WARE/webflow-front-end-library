/**
 * ToggleHeight Class
 * 
 * The `ToggleHeight` class enables smooth height toggling of DOM elements, making it ideal for FAQ sections, accordions, and similar UI components where content needs to be expanded or collapsed. This class supports configurable trigger elements, target elements, rotation elements, and offers options for duration, easing, and more.
 * 
 * @version 1.0.0
 * @license MIT
 * 
 * ## Usage
 * 
 * Include this script via a CDN or local file, then instantiate the `ToggleHeight` class with the desired configuration options.
 * 
 * ```html
 * <div class="faq-container">
 *     <div class="faq-item">
 *         <div class="faq-question">
 *             What is your return policy?
 *             <span class="faq-icon">▼</span>
 *         </div>
 *         <div class="faq-answer">
 *             Our return policy allows you to return items within 30 days of purchase.
 *         </div>
 *     </div>
 *     <div class="faq-item">
 *         <div class="faq-question">
 *             How can I contact customer service?
 *             <span class="faq-icon">▼</span>
 *         </div>
 *         <div class="faq-answer">
 *             You can reach our customer service via email at support@example.com.
 *         </div>
 *     </div>
 * </div>
 * ```
 * 
 * ```javascript
 * const toggleConfigs = [
 *     {
 *         parentSelector: '.faq-container',
 *         triggerSelector: '.faq-question',
 *         targetSelector: '.faq-answer',
 *         rotateSelector: '.faq-icon',
 *         isOpen: false,
 *         duration: 300,
 *         closeOthers: true,
 *         easingMode: 'ease-in-out',
 *         fontSizeMultiplier: 1,
 *         expandedRotation: 90
 *     }
 * ];
 * 
 * // Initialize the ToggleHeight class with the provided configurations
 * const toggleHeight = new ToggleHeight(toggleConfigs);
 * ```
 * 
 * ## Configuration Options
 * 
 * Each configuration object within the `configs` array can have the following properties:
 * 
 * | Property              | Type                 | Description                                                                                                                                                     |
 * |-----------------------|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
 * | `parentSelector`     | `string`             | Selector for the parent elements that contain triggers and targets (e.g., `.faq-container`). If not specified, the entire document is used.                     |
 * | `triggerSelector`    | `string` **(Required)** | Selector for the elements that act as triggers to toggle the height (e.g., `.faq-question`).                                                                      |
 * | `targetSelector`     | `string` **(Required)** | Selector for the elements whose height will be toggled (e.g., `.faq-answer`).                                                                                     |
 * | `rotateSelector`     | `string`             | Selector for the elements that should rotate when the trigger is clicked (e.g., `.faq-icon`). Optional.                                                        |
 * | `isOpen`             | `boolean`            | Determines whether the target elements should be open by default. Default is `false`.                                                                              |
 * | `duration`           | `number`             | Duration of the height transition in milliseconds. Default is `300`.                                                                                                |
 * | `closeOthers`        | `boolean`            | If `true`, opening one target will close others within the same configuration. Default is `true`.                                                                  |
 * | `easingMode`         | `string`             | CSS easing function for the transitions (e.g., `ease`, `ease-in`, `ease-out`, `ease-in-out`). Default is `'ease'`.                                                 |
 * | `fontSizeMultiplier` | `number`             | **(Optional)** Multiplier for the root `font-size` used to calculate the collapsed height. Default is `1`.                                                         |
 * | `expandedRotation`   | `number`             | **(Optional)** The rotation angle in degrees when the element is expanded. Default is `90`.                                                                         |
 * 
 * ### Notes
 * 
 * - **Parent Selector**: Allows grouping of trigger and target elements within a common container.
 * - **Rotate Selector**: Useful for icons or arrows that should rotate to indicate the expanded/collapsed state.
 * - **Close Others**: Ideal for accordion behavior where only one section should be open at a time.
 * - **Font Size Multiplier**: Enables dynamic adjustment of the collapsed height based on the root font size, enhancing responsiveness.
 * - **Expanded Rotation**: Controls the rotation angle of the rotation element to provide visual feedback.
 * - **Touch Support**: The class includes touch event handling to ensure functionality on touch devices.
 * 
 * ## Methods
 * 
 * | Method                                  | Description                                                                                                                   |
 * |-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
 * | `constructor(configs)`                  | Initializes the class with the provided configurations and sets up the necessary event listeners.                             |
 * | `getRootFontSize()`                     | Retrieves the root font size of the document in pixels.                                                                       |
 * | `getCollapsedHeight(config)`            | Calculates the collapsed height based on the root font size and the multiplier.                                               |
 * | `domContentLoadedHandler()`             | Handler for the `DOMContentLoaded` event. Initializes all configurations and sets up the window resize listener.              |
 * | `initConfig(config)`                    | Initializes a single configuration by selecting DOM elements and setting up event listeners.                                  |
 * | `initElement(element, config)`          | Initializes the styles of the target element for height transitions.                                                          |
 * | `handleToggle(index, target, rotateElement, config)` | Handles the toggle action when a trigger is activated.                                                        |
 * | `expand(target, rotateElement, config)` | Expands the target element to its full height.                                                                                |
 * | `collapse(target, rotateElement, config)` | Collapses the target element to the calculated height.                                                                     |
 * | `rotate(element, degrees, duration, easingMode)` | Rotates an element to a specified degree.                                                                              |
 * | `onWindowResize()`                      | Handles window resize events to adjust the heights of open and collapsed elements accordingly.                                 |
 * 
 * ## Example
 * 
 * ```html
 * <div class="faq-container">
 *     <div class="faq-item">
 *         <div class="faq-question">
 *             What is your return policy?
 *             <span class="faq-icon">▼</span>
 *         </div>
 *         <div class="faq-answer">
 *             Our return policy allows you to return items within 30 days of purchase.
 *         </div>
 *     </div>
 *     <div class="faq-item">
 *         <div class="faq-question">
 *             How can I contact customer service?
 *             <span class="faq-icon">▼</span>
 *         </div>
 *         <div class="faq-answer">
 *             You can reach our customer service via email at support@example.com.
 *         </div>
 *     </div>
 * </div>
 * ```
 * 
 * ```javascript
 * const toggleConfigs = [
 *     {
 *         parentSelector: '.faq-container',
 *         triggerSelector: '.faq-question',
 *         targetSelector: '.faq-answer',
 *         rotateSelector: '.faq-icon',
 *         isOpen: false,
 *         duration: 300,
 *         closeOthers: true,
 *         easingMode: 'ease-in-out',
 *         fontSizeMultiplier: 1,
 *         expandedRotation: 90
 *     }
 * ];
 * 
 * // Initialize the ToggleHeight class with the provided configurations
 * const toggleHeight = new ToggleHeight(toggleConfigs);
 * ```
 * 
 * In this example:
 * 
 * - **HTML Structure**: Each FAQ consists of a question (`.faq-question`) and an answer (`.faq-answer`). An icon (`.faq-icon`) indicates the state.
 * - **Configuration**:
 *   - **Parent Selector**: `.faq-container` groups all FAQ items.
 *   - **Trigger Selector**: `.faq-question` are the clickable areas that toggle the answers.
 *   - **Target Selector**: `.faq-answer` are the areas whose height is toggled.
 *   - **Rotate Selector**: `.faq-icon` rotates when the answer is expanded.
 *   - **Close Others**: When opening an answer, other answers within the container are closed.
 * 
 * ## License
 * 
 * This code is licensed under the MIT License. You are free to use, modify, and distribute it as you wish.
 */
class ToggleHeight {
    /**
     * Constructs a new ToggleHeight instance.
     * 
     * @param {Array<ToggleHeightConfig>} configs - An array of configuration objects for height toggling.
     * @throws {Error} Throws an error if the provided configurations are not an array.
     */
    constructor(configs) {
        if (!Array.isArray(configs)) {
            configs = [configs];
        }
        this.configs = configs.map(config => ({
            ...config,
            parents: [],
            rotateElements: [],
            triggers: [],
            targets: [],
            touchStartY: 0,
            currentOpenIndex: null,
            fontSizeMultiplier: config.fontSizeMultiplier !== undefined ? config.fontSizeMultiplier : 1,
            expandedRotation: config.expandedRotation !== undefined ? config.expandedRotation : 90 // New parameter
        }));

        this.domContentLoadedHandler = this.domContentLoadedHandler.bind(this);
        document.addEventListener('DOMContentLoaded', this.domContentLoadedHandler);
    }

    /**
     * Retrieves the root font size of the document in pixels.
     * @returns {number} The root font size as a number (e.g., 16).
     * @private
     */
    getRootFontSize() {
        const fontSizeStr = window.getComputedStyle(document.documentElement).fontSize;
        return parseFloat(fontSizeStr);
    }

    /**
     * Calculates the collapsed height based on the root font size and the multiplier.
     * @param {ToggleHeightConfig} config - The current configuration.
     * @returns {string} The collapsed height as a string with unit (e.g., '16px').
     * @private
     */
    getCollapsedHeight(config) {
        const rootFontSize = this.getRootFontSize();
        const collapsedHeight = rootFontSize * config.fontSizeMultiplier;
        return `${collapsedHeight}px`;
    }

    /**
     * Handler for the DOMContentLoaded event. Initializes all configurations and sets up the window resize listener.
     * @private
     */
    domContentLoadedHandler() {
        this.configs.forEach(config => this.initConfig(config));
        document.removeEventListener('DOMContentLoaded', this.domContentLoadedHandler);

        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);
    }

    /**
     * Initializes a single configuration by selecting DOM elements and setting up event listeners.
     * @param {ToggleHeightConfig} config - The configuration object to initialize.
     * @private
     */
    initConfig(config) {
        const {
            parentSelector = '',
            triggerSelector,
            targetSelector,
            rotateSelector = '',
            isOpen = false,
            duration = 300,
            closeOthers = true,
            easingMode = 'ease',
            fontSizeMultiplier = 1,
            expandedRotation = 90 // New parameter
        } = config;

        if (!triggerSelector || !targetSelector) {
            console.error('triggerSelector and targetSelector are required in ToggleHeightConfig.');
            return;
        }

        if (parentSelector) {
            config.parents = document.querySelectorAll(parentSelector);
        } else {
            config.parents = [document];
        }

        config.duration = duration;
        config.closeOthers = closeOthers;
        config.easingMode = easingMode;
        config.fontSizeMultiplier = fontSizeMultiplier;
        config.expandedRotation = expandedRotation; // Set new parameter

        config.parents.forEach(parent => {
            const triggersInParent = parent.querySelectorAll(triggerSelector);
            const targetsInParent = parent.querySelectorAll(targetSelector);
            const rotateElementsInParent = rotateSelector ? parent.querySelectorAll(rotateSelector) : [];

            config.triggers.push(...triggersInParent);
            config.targets.push(...targetsInParent);
            config.rotateElements.push(...rotateElementsInParent);
        });

        config.triggers.forEach((trigger, index) => {
            const target = config.targets[index] || trigger;
            const rotateElement = config.rotateElements[index] || null;
            this.initElement(target, config);

            if (isOpen) {
                if (rotateElement) {
                    this.rotate(rotateElement, config.expandedRotation, config.duration, config.easingMode);
                }
                config.currentOpenIndex = index;
            }

            trigger.addEventListener('click', () => this.handleToggle(index, target, rotateElement, config));

            trigger.addEventListener('touchstart', (e) => {
                config.touchStartY = e.touches[0].clientY;
            });

            trigger.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                if (Math.abs(touchEndY - config.touchStartY) < 10) {
                    e.preventDefault();
                    this.handleToggle(index, target, rotateElement, config);
                }
            });
        });
    }

    /**
     * Initializes the styles of the target element for height transitions.
     * @param {HTMLElement} element - The element whose height will be toggled.
     * @param {ToggleHeightConfig} config - The current configuration.
     * @private
     */
    initElement(element, config) {
        element.style.overflow = 'hidden';
        element.style.transition = `height ${config.duration}ms ${config.easingMode}`;
        if (config.isOpen) {
            element.style.height = `${element.scrollHeight}px`;
        } else {
            element.style.height = this.getCollapsedHeight(config);
        }
    }

    /**
     * Handles the toggle action when a trigger is activated.
     * @param {number} index - The index of the activated trigger.
     * @param {HTMLElement} target - The target element to be toggled.
     * @param {HTMLElement|null} rotateElement - The element to rotate, if any.
     * @param {ToggleHeightConfig} config - The current configuration.
     * @private
     */
    handleToggle(index, target, rotateElement, config) {
        const collapsedHeight = parseFloat(this.getCollapsedHeight(config));
        const currentHeight = parseFloat(target.style.height);
        const isCollapsed = currentHeight <= collapsedHeight;

        if (config.closeOthers) {
            if (config.currentOpenIndex !== null && config.currentOpenIndex !== index) {
                const currentOpenTarget = config.targets[config.currentOpenIndex];
                const currentRotateElement = config.rotateElements[config.currentOpenIndex] || null;
                this.collapse(currentOpenTarget, currentRotateElement, config);
            }
        }

        if (isCollapsed) {
            this.expand(target, rotateElement, config);
            if (config.closeOthers) {
                config.currentOpenIndex = index;
            }
        } else {
            this.collapse(target, rotateElement, config);
            if (config.closeOthers) {
                config.currentOpenIndex = null;
            }
        }
    }

    /**
     * Expands the target element to its full height.
     * @param {HTMLElement} target - The element to expand.
     * @param {HTMLElement|null} rotateElement - The element to rotate, if any.
     * @param {ToggleHeightConfig} config - The current configuration.
     * @private
     */
    expand(target, rotateElement, config) {
        target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
        target.style.height = `${target.scrollHeight}px`;
        if (rotateElement) {
            this.rotate(rotateElement, config.expandedRotation, config.duration, config.easingMode);
        }
    }

    /**
     * Collapses the target element to the calculated height based on the root font size and multiplier.
     * @param {HTMLElement} target - The element to collapse.
     * @param {HTMLElement|null} rotateElement - The element to rotate, if any.
     * @param {ToggleHeightConfig} config - The current configuration.
     * @private
     */
    collapse(target, rotateElement, config) {
        target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
        target.style.height = this.getCollapsedHeight(config);
        if (rotateElement) {
            this.rotate(rotateElement, 0, config.duration, config.easingMode);
        }
    }

    /**
     * Rotates an element to a specified degree.
     * @param {HTMLElement} element - The element to rotate.
     * @param {number} degrees - The degree to rotate the element to.
     * @param {number} duration - Duration of the rotation transition in milliseconds.
     * @param {string} easingMode - CSS easing function for the rotation transition.
     * @private
     */
    rotate(element, degrees, duration, easingMode) {
        element.style.transition = `transform ${duration}ms ${easingMode}`;
        element.style.transform = `rotate(${degrees}deg)`;
    }

    /**
     * Handles window resize events to adjust the heights of open and collapsed elements accordingly.
     * @private
     */
    onWindowResize() {
        this.configs.forEach(config => {
            const newCollapsedHeight = this.getCollapsedHeight(config);
            config.targets.forEach((target, index) => {
                const rotateElement = config.rotateElements[index] || null;
                const isOpen = parseFloat(target.style.height) > parseFloat(newCollapsedHeight);

                if (isOpen) {
                    // Element is open, update its height based on the new scrollHeight
                    const originalTransition = target.style.transition;
                    target.style.transition = 'none';
                    target.style.height = `${target.scrollHeight}px`;
                    // Trigger reflow
                    target.offsetHeight;
                    target.style.transition = originalTransition;
                } else {
                    // Element is collapsed, update its height based on the new multiplier
                    target.style.transition = 'height 0ms';
                    target.style.height = newCollapsedHeight;
                    // Trigger reflow
                    target.offsetHeight;
                    // Restore the transition
                    target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
                }
            });
        });
    }
}

// Expose the ToggleHeight class for external access
window.ToggleHeight = ToggleHeight;
