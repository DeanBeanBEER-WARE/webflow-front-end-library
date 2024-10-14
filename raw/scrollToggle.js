/**
 * ScrollToggle Class
 * 
 * A utility class to enable or disable page scrolling based on specific conditions
 * triggered by various events (e.g., scroll, click, hover). It continuously monitors
 * the conditions for a specified duration after each event to ensure smooth transitions.
 * 
 * @version 1.0.0
 * @author 
 * @license MIT
 * 
 * ## Usage
 * 
 * Include this script via a CDN or local file, then instantiate the `ScrollToggle` class
 * with the desired configuration options.
 * 
 * ```javascript
 * new ScrollToggle({
 *   checkEvent: 'click', // 'scroll', 'click' or 'hover'
 *   conditionElements: ['menuwhite', 'menublack'], // IDs of elements to check CSS attributes
 *   conditionArray: [
 *     {
 *       conditionAttribute: 'opacity',
 *       conditionActive: '1',
 *       conditionDisable: '0'
 *     }
 *   ]
 * });
 * ```
 * 
 * ## Configuration Options
 * 
 * | Option             | Type     | Description                                                                                   |
 * |--------------------|----------|-----------------------------------------------------------------------------------------------|
 * | `checkEvent`       | `string` | The event type to listen for. Possible values: `'scroll'`, `'click'`, `'hover'`.              |
 * | `hoverTriggers`    | `array`  | (Optional) An array of class names to attach hover event listeners to.                        |
 * | `triggerElements`  | `array`  | (Optional) An array of element IDs to attach the primary event listeners to.                  |
 * | `conditionElements`| `array`  | An array of element IDs whose CSS attributes will be checked against specified conditions.    |
 * | `conditionArray`   | `array`  | An array of condition objects defining the attributes to check and their target values.       |
 * 
 * ### Condition Object Structure
 * 
 * Each object in the `conditionArray` should have the following properties:
 * 
 * | Property             | Type     | Description                                                                                 |
 * |----------------------|----------|---------------------------------------------------------------------------------------------|
 * | `conditionAttribute` | `string` | The CSS attribute to monitor (e.g., `'opacity'`, `'display'`).                              |
 * | `conditionActive`    | `string` | The value of `conditionAttribute` that enables scrolling when matched.                      |
 * | `conditionDisable`   | `string` | The value of `conditionAttribute` that disables scrolling when matched.                     |
 * 
 * ## Example
 * 
 * ```javascript
 * new ScrollToggle({
 *   checkEvent: 'hover',
 *   hoverTriggers: ['hover-class'],
 *   conditionElements: ['menuwhite', 'menublack'],
 *   conditionArray: [
 *     {
 *       conditionAttribute: 'opacity',
 *       conditionActive: '1',
 *       conditionDisable: '0'
 *     }
 *   ]
 * });
 * ```
 */

(function(global) {
  'use strict';

  /**
   * ScrollToggle Class
   */
  class ScrollToggle {
    /**
     * Creates an instance of ScrollToggle.
     * 
     * @param {Object} options - Configuration options for ScrollToggle.
     * @param {string} options.checkEvent - The event type to listen for ('scroll', 'click', 'hover').
     * @param {Array<string>} [options.hoverTriggers=[]] - Array of class names to attach hover listeners to.
     * @param {Array<string>} [options.triggerElements=[]] - Array of element IDs to attach event listeners to.
     * @param {Array<string>} [options.conditionElements=[]] - Array of element IDs whose CSS attributes are checked.
     * @param {Array<Object>} options.conditionArray - Array of condition objects defining attributes and their target values.
     */
    constructor(options) {
      // Log the initialization process with provided options
      console.log('ScrollToggle: Initialization started with options:', options);
      
      /**
       * @property {Object} options - Stores the initial configuration options.
       */
      this.options = options;

      /**
       * @property {Function} handleEvent - Bound event handler to maintain correct context.
       */
      this.handleEvent = this.handleEvent.bind(this);

      /**
       * @property {number|null} debounceTimeout - Timeout identifier for debouncing events.
       */
      this.debounceTimeout = null;

      /**
       * @property {number} debounceDelay - Delay in milliseconds for debouncing.
       */
      this.debounceDelay = 50; // milliseconds

      /**
       * @property {number} checkInterval - Interval in milliseconds for repeated condition checks.
       */
      this.checkInterval = 200; // milliseconds

      /**
       * @property {number} maxCheckDuration - Maximum duration in milliseconds for repeated checks.
       */
      this.maxCheckDuration = 1000; // milliseconds

      // Initialize after the DOM content has fully loaded
      document.addEventListener('DOMContentLoaded', () => {
        console.log('ScrollToggle: DOMContentLoaded triggered. Initializing...');
        this.init();
        this.observeMutations();
      });
    }

    /**
     * Initializes event listeners based on the configuration options.
     */
    init() {
      console.log(`ScrollToggle: Initializing Event Listener for '${this.options.checkEvent}' event.`);

      // Destructure options for easier access
      const {
        checkEvent,
        hoverTriggers = [],
        triggerElements = [],
        conditionElements = [],
        conditionArray = []
      } = this.options;

      // Store the event type and hover triggers
      this.checkEvent = checkEvent;
      this.hoverTriggers = hoverTriggers;

      /**
       * @property {Array<Element|null>} triggerElements - Array of elements to attach primary event listeners to.
       */
      this.triggerElements = triggerElements.map(id => {
        const el = document.getElementById(id);
        console.log(`ScrollToggle: Trigger element with ID '${id}' found:`, el);
        return el;
      });

      /**
       * @property {Array<Element|null>} conditionElements - Array of elements whose attributes are monitored.
       */
      this.conditionElements = conditionElements.map(id => {
        const el = document.getElementById(id);
        console.log(`ScrollToggle: Condition element with ID '${id}' found:`, el);
        return el;
      });

      /**
       * @property {Array<Object>} conditionArray - Array of condition objects defining attribute checks.
       */
      this.conditionArray = conditionArray;

      // Set up event listeners based on the specified checkEvent
      switch (this.checkEvent) {
        case 'scroll':
          window.addEventListener('scroll', this.handleEvent);
          console.log('ScrollToggle: Scroll event listener added.');
          break;
        case 'click':
          document.addEventListener('click', this.handleEvent);
          console.log('ScrollToggle: Click event listener added.');
          break;
        case 'hover':
          this.hoverTriggers.forEach(cls => {
            const elements = document.getElementsByClassName(cls);
            console.log(`ScrollToggle: Adding hover event listeners for class '${cls}'. Number of elements: ${elements.length}`);
            Array.from(elements).forEach(el => {
              el.addEventListener('mouseenter', this.handleEvent);
              el.addEventListener('mouseleave', this.handleEvent);
              console.log(`ScrollToggle: Hover event listener added to element:`, el);
            });
          });
          break;
        default:
          console.warn(`ScrollToggle: Unknown checkEvent: '${this.checkEvent}'`);
      }

      // Perform an initial condition check upon initialization
      this.checkConditions();
    }

    /**
     * Handles the specified event by initiating condition checks.
     * 
     * @param {Event} event - The event object that was triggered.
     */
    handleEvent(event) {
      console.log(`ScrollToggle: Event '${this.checkEvent}' triggered by:`, event.target);
      
      // Immediately check conditions once the event is triggered
      this.checkConditions();

      // Start repeated condition checks every 200ms up to a maximum of 1 second
      let elapsed = 0;
      const interval = this.checkInterval; // milliseconds
      const maxDuration = this.maxCheckDuration; // milliseconds

      const intervalId = setInterval(() => {
        elapsed += interval;
        console.log(`ScrollToggle: Repeated condition check after ${elapsed}ms`);
        this.checkConditions();

        // Stop checking after reaching the maximum duration
        if (elapsed >= maxDuration) {
          clearInterval(intervalId);
          console.log('ScrollToggle: Stopped repeated condition checks after 1 second.');
        }
      }, interval);
    }

    /**
     * Checks the specified conditions and enables or disables scrolling accordingly.
     */
    checkConditions() {
      console.log('ScrollToggle: Checking conditions...');
      let shouldEnableScroll = false;
      let shouldDisableScroll = false;

      // Iterate through each condition defined in the conditionArray
      this.conditionArray.forEach((condition, index) => {
        const { conditionAttribute, conditionActive, conditionDisable } = condition;
        console.log(`ScrollToggle: Evaluating Condition ${index + 1}: Attribute='${conditionAttribute}', Active='${conditionActive}', Disable='${conditionDisable}'`);
        
        // Iterate through each condition element to evaluate the condition
        this.conditionElements.forEach((element, elIndex) => {
          if (!element) {
            console.warn(`ScrollToggle: Condition element at index ${elIndex} is undefined.`);
            return;
          }

          // Retrieve the computed style of the specified attribute
          const computedStyle = window.getComputedStyle(element);
          const attributeValue = computedStyle.getPropertyValue(conditionAttribute).trim();
          console.log(`ScrollToggle: Element ID='${element.id}', Attribute='${conditionAttribute}', Value='${attributeValue}'`);

          // Check if the attribute value matches the disable condition
          if (this.compareValues(attributeValue, conditionDisable)) {
            console.log(`ScrollToggle: 'conditionDisable' met for element ID='${element.id}'. Disabling scroll.`);
            shouldDisableScroll = true;
          }
          // If disable condition is not met, check if the attribute value matches the active condition
          else if (this.compareValues(attributeValue, conditionActive)) {
            console.log(`ScrollToggle: 'conditionActive' met for element ID='${element.id}'. Enabling scroll.`);
            shouldEnableScroll = true;
          }
        });
      });

      // Apply scroll settings based on evaluated conditions
      if (shouldDisableScroll) {
        console.log('ScrollToggle: At least one disable condition met. Disabling scroll.');
        this.disableScroll();
      } else if (shouldEnableScroll) {
        console.log('ScrollToggle: Active conditions met. Enabling scroll.');
        this.enableScroll();
      } else {
        console.log('ScrollToggle: No conditions met. Scroll status remains unchanged.');
      }
    }

    /**
     * Compares the current attribute value with the target value.
     * 
     * @param {string} current - The current value of the attribute.
     * @param {string} target - The target value to compare against.
     * @returns {boolean} - Returns `true` if values match, else `false`.
     */
    compareValues(current, target) {
      // Convert both values to floating-point numbers for comparison
      const currentValue = parseFloat(current);
      const targetValue = parseFloat(target);
      const result = currentValue === targetValue;
      console.log(`ScrollToggle: Comparing values - Current: ${currentValue} vs Target: ${targetValue} -> ${result}`);
      return result;
    }

    /**
     * Enables page scrolling by resetting the `overflow` style.
     */
    enableScroll() {
      document.body.style.overflow = '';
      // Additional actions can be added here if needed when enabling scroll
      console.log('ScrollToggle: Scroll enabled (document.body.style.overflow reset).');
    }

    /**
     * Disables page scrolling by setting the `overflow` style to 'hidden'.
     */
    disableScroll() {
      document.body.style.overflow = 'hidden';
      // Additional actions can be added here if needed when disabling scroll
      console.log('ScrollToggle: Scroll disabled (document.body.style.overflow set to "hidden").');
    }

    /**
     * Observes mutations (attribute changes) on condition elements to trigger condition checks.
     */
    observeMutations() {
      console.log('ScrollToggle: Initializing MutationObserver for condition elements.');
      
      // Configuration for MutationObserver to watch specified attributes
      const config = { 
        attributes: true, 
        attributeFilter: this.conditionArray.map(cond => cond.conditionAttribute) 
      };

      // Iterate through each condition element to set up observers
      this.conditionElements.forEach((element, index) => {
        if (element) {
          const observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
              if (mutation.type === 'attributes') {
                console.log(`ScrollToggle: MutationObserver detected - Attribute '${mutation.attributeName}' changed on element ID='${element.id}'.`);
                this.checkConditions();
              }
            }
          });
          observer.observe(element, config);
          console.log(`ScrollToggle: MutationObserver set up for element ID='${element.id}'.`);
        } else {
          console.warn(`ScrollToggle: Condition element at index ${index} is undefined. MutationObserver not set up.`);
        }
      });
    }
  }

  // Expose ScrollToggle to the global scope for CDN usage
  global.ScrollToggle = ScrollToggle;

})(window);