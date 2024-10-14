/**
 * ScrollManager Class
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
 * Include this script via a CDN or local file, then instantiate the `ScrollManager` class
 * with the desired configuration options.
 * 
 * ```javascript
 * new ScrollManager({
 *   scrollSpeed: 30,                  // Number of pixels to scroll per scroll event
 *   smoothScrollFactor: 90,           // Smoothness factor (0 to 100)
 *   pageWrapper: 'pagewrapper',       // ID of the page wrapper element
 *   easingMode: 'ease-out',           // Easing mode: 'ease', 'ease-in', 'ease-out', 'ease-in-out'
 *   checkEvent: 'click',              // Event to trigger condition checks: 'scroll', 'click', 'hover'
 *   hoverTriggers: ['hover-trigger'],  // Classes of elements that trigger hover events
 *   triggerElements: [],               // IDs of elements that trigger the primary events (optional)
 *   conditionElements: ['menuwhite', 'menublack'], // IDs of elements whose CSS attributes are checked
 *   conditionArray: [
 *     {
 *       conditionAttribute: 'opacity', // CSS attribute to monitor
 *       conditionActive: '0',          // Value that enables scrolling
 *       conditionDisable: '1'          // Value that disables scrolling
 *     }
 *   ],
 *   maxCheckDuration: 700             // Maximum duration for repeated checks in milliseconds
 * });
 * ```
 * 
 * ## Configuration Options
 * 
 * | Option               | Type       | Description                                                                                       |
 * |----------------------|------------|---------------------------------------------------------------------------------------------------|
 * | `scrollSpeed`        | `number`   | Number of pixels to scroll per scroll event.                                                      |
 * | `smoothScrollFactor` | `number`   | Smoothness factor for the scroll animation (0 to 100).                                           |
 * | `pageWrapper`        | `string`   | ID of the page wrapper element that contains all scrollable content.                              |
 * | `easingMode`         | `string`   | Easing mode for the scroll animation. Possible values: `'ease'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'`. |
 * | `checkEvent`         | `string`   | Event type to listen for to trigger condition checks. Possible values: `'scroll'`, `'click'`, `'hover'`. |
 * | `hoverTriggers`      | `array`    | (Optional) Array of class names to attach hover event listeners to.                               |
 * | `triggerElements`    | `array`    | (Optional) Array of element IDs to attach the primary event listeners to.                         |
 * | `conditionElements`  | `array`    | Array of element IDs whose CSS attributes will be checked against specified conditions.           |
 * | `conditionArray`     | `array`    | Array of condition objects defining the attributes to check and their target values.              |
 * | `maxCheckDuration`   | `number`   | Maximum duration for repeated condition checks in milliseconds.                                   |
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
 * new ScrollManager({
 *   scrollSpeed: 30,
 *   smoothScrollFactor: 90,
 *   pageWrapper: 'pagewrapper',
 *   easingMode: 'ease-out',
 *   checkEvent: 'click',
 *   hoverTriggers: ['hover-trigger'],
 *   triggerElements: [],
 *   conditionElements: ['menuwhite', 'menublack'],
 *   conditionArray: [
 *     {
 *       conditionAttribute: 'opacity',
 *       conditionActive: '0',
 *       conditionDisable: '1'
 *     }
 *   ],
 *   maxCheckDuration: 700
 * });
 * ```
 */

(function(global) {
    class ScrollManager {
      /**
       * Constructor for ScrollManager
       * @param {Object} options - Configuration object
       * @param {number} options.scrollSpeed - Number of pixels to scroll per scroll event
       * @param {number} options.smoothScrollFactor - Smoothness factor in percentage (0 to 100)
       * @param {string} options.pageWrapper - ID of the page wrapper element
       * @param {string} [options.easingMode] - Easing mode: 'ease', 'ease-in', 'ease-out', 'ease-in-out'
       * @param {string} [options.checkEvent] - Event to trigger condition checks: 'scroll', 'click', 'hover'
       * @param {Array<string>} [options.hoverTriggers] - Classes of elements that trigger hover events
       * @param {Array<string>} [options.triggerElements] - IDs of elements that trigger primary events
       * @param {Array<string>} [options.conditionElements] - IDs of elements whose CSS attributes are checked
       * @param {Array<Object>} [options.conditionArray] - Conditions to control scrolling
       * @param {number} [options.maxCheckDuration] - Maximum duration for repeated checks in milliseconds
       */
      constructor(options) {
        // Store options for later use
        this.options = options;
  
        // Bind handlers to maintain the correct 'this' context
        this.handleWheel = this.handleWheel.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleEvent = this.handleEvent.bind(this);
        this.animateScroll = this.animateScroll.bind(this);
  
        this.debounceTimeout = null;
        this.debounceDelay = 50; // milliseconds
  
        // ScrollController parameters
        this.scrollSpeed = options.scrollSpeed || 100;
        this.smoothScrollFactor = options.smoothScrollFactor || 50;
        this.pageWrapperId = options.pageWrapper || 'pagewrapper';
        this.easingMode = options.easingMode || 'ease';
  
        // ScrollToggle parameters
        this.checkEvent = options.checkEvent || 'scroll'; // Default to 'scroll'
        this.hoverTriggers = options.hoverTriggers || [];
        this.triggerElements = options.triggerElements || [];
        this.conditionElementsIDs = options.conditionElements || [];
        this.conditionArray = options.conditionArray || [];
        this.maxCheckDuration = options.maxCheckDuration || 1000; // Default 1000ms
        this.numChecks = 5;
  
        // Initial scroll values
        this.targetScroll = 0;
        this.currentScroll = 0;
        this.isAnimating = false; // Flag to control the animation loop
        this.startScroll = 0;
        this.startTime = null;
  
        // Touch parameters
        this.isTouching = false;
        this.touchStartY = 0;
        this.touchDeltaY = 0;
  
        // Scroll enabled flag
        this.isScrollingEnabled = true;
  
        // Easing functions
        this.easingFunctions = {
          'ease': this.ease,
          'ease-in': this.easeIn,
          'ease-out': this.easeOut,
          'ease-in-out': this.easeInOut
        };
  
        // Validate easingMode
        if (!this.easingFunctions[this.easingMode]) {
          console.warn(`ScrollManager: Invalid easingMode "${this.easingMode}". Using "ease" as default.`);
          this.easingMode = 'ease';
        }
  
        // Initialize after DOM is fully loaded or immediately if already loaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            this.init();
            this.observeMutations();
          });
        } else {
          // DOM already loaded
          this.init();
          this.observeMutations();
        }
      }
  
      /**
       * Easing function: ease (cubic-bezier(0.25, 0.1, 0.25, 1.0))
       * @param {number} t - Progress (0 to 1)
       * @returns {number} - Eased progress
       */
      ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
  
      /**
       * Easing function: ease-in (cubic-bezier(0.42, 0, 1.0, 1.0))
       * @param {number} t - Progress (0 to 1)
       * @returns {number} - Eased progress
       */
      easeIn(t) {
        return t * t * t;
      }
  
      /**
       * Easing function: ease-out (cubic-bezier(0, 0, 0.58, 1.0))
       * @param {number} t - Progress (0 to 1)
       * @returns {number} - Eased progress
       */
      easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
      }
  
      /**
       * Easing function: ease-in-out (cubic-bezier(0.42, 0, 0.58, 1.0))
       * @param {number} t - Progress (0 to 1)
       * @returns {number} - Eased progress
       */
      easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
  
      /**
       * Initializes the ScrollManager class
       */
      init() {
        this.pageWrapper = document.getElementById(this.pageWrapperId);
        if (!this.pageWrapper) {
          console.error(`ScrollManager: Element with ID "${this.pageWrapperId}" not found.`);
          return;
        }
  
        // Set CSS properties for body and pageWrapper
        document.body.style.overflow = 'hidden'; // Disable native scrolling
        this.pageWrapper.style.position = 'fixed'; // Fix the wrapper
        this.pageWrapper.style.top = '0';
        this.pageWrapper.style.left = '0';
        this.pageWrapper.style.width = '100%';
        this.pageWrapper.style.height = '100%';
        this.pageWrapper.style.overflow = 'hidden'; // Disable native scrolling in wrapper
  
        // Set initial scroll values
        this.currentScroll = this.pageWrapper.scrollTop;
        this.targetScroll = this.currentScroll;
  
        // Add event listeners for scrolling and touch
        window.addEventListener('wheel', this.handleWheel, { passive: false });
        this.pageWrapper.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.pageWrapper.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.pageWrapper.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  
        // Map conditionElements IDs to actual DOM elements
        this.conditionElements = this.conditionElementsIDs.map((id, index) => {
          const el = document.getElementById(id);
          if (!el) {
            console.warn(`ScrollManager: Condition element at index ${index} (ID: '${id}') is not defined.`);
          }
          return el;
        });
  
        // Set up event listeners based on the checkEvent
        this.setupToggleEventListeners();
  
        // Initial condition check
        this.checkConditions();
      }
  
      /**
       * Sets up event listeners for ScrollToggle based on the checkEvent
       */
      setupToggleEventListeners() {
        switch (this.checkEvent) {
          case 'scroll':
            window.addEventListener('scroll', this.handleEvent);
            break;
          case 'click':
            document.addEventListener('click', this.handleEvent);
            break;
          case 'hover':
            this.hoverTriggers.forEach(cls => {
              const elements = document.getElementsByClassName(cls);
              Array.from(elements).forEach(el => {
                el.addEventListener('mouseenter', this.handleEvent);
                el.addEventListener('mouseleave', this.handleEvent);
              });
            });
            break;
          default:
            console.warn(`ScrollManager: Unknown checkEvent '${this.checkEvent}'.`);
        }
      }
  
      /**
       * Enables scrolling
       */
      enableScroll() {
        if (this.isScrollingEnabled) return; // Already enabled
        this.isScrollingEnabled = true;
        document.body.style.overflow = 'hidden'; // Keep native scroll disabled
        this.pageWrapper.style.overflow = 'hidden'; // Keep native scroll disabled in wrapper
      }
  
      /**
       * Disables scrolling
       */
      disableScroll() {
        if (!this.isScrollingEnabled) return; // Already disabled
        this.isScrollingEnabled = false;
        document.body.style.overflow = ''; // Restore native scrolling
        this.pageWrapper.style.overflow = ''; // Restore native scrolling in wrapper
      }
  
      /**
       * Handles the wheel event
       * @param {WheelEvent} event 
       */
      handleWheel(event) {
        if (!this.isScrollingEnabled) return;
        event.preventDefault(); // Prevent native scrolling
  
        // Determine scroll direction
        const direction = event.deltaY > 0 ? 'down' : 'up';
  
        // Update targetScroll based on direction and speed
        this.targetScroll += event.deltaY > 0 ? this.scrollSpeed : -this.scrollSpeed;
  
        // Clamp targetScroll within allowed boundaries
        const maxScroll = this.pageWrapper.scrollHeight - window.innerHeight;
        this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
  
        // Start animation if not already running
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.startTime = null; // Reset start time
          this.startScroll = this.pageWrapper.scrollTop;
          requestAnimationFrame(this.animateScroll);
        }
      }
  
      /**
       * Handles the touchstart event
       * @param {TouchEvent} event 
       */
      handleTouchStart(event) {
        if (event.touches.length !== 1) return; // Only handle single touches
        this.isTouching = true;
        this.touchStartY = event.touches[0].clientY;
        this.touchDeltaY = 0;
      }
  
      /**
       * Handles the touchmove event
       * @param {TouchEvent} event 
       */
      handleTouchMove(event) {
        if (!this.isTouching || event.touches.length !== 1) return;
        const touchCurrentY = event.touches[0].clientY;
        this.touchDeltaY = this.touchStartY - touchCurrentY;
  
        // Update targetScroll based on touch movement and speed
        this.targetScroll += this.touchDeltaY;
  
        // Clamp targetScroll within allowed boundaries
        const maxScroll = this.pageWrapper.scrollHeight - window.innerHeight;
        this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
  
        // Update touchStartY for the next movement
        this.touchStartY = touchCurrentY;
  
        // Start animation if not already running
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.startTime = null; // Reset start time
          this.startScroll = this.pageWrapper.scrollTop;
          requestAnimationFrame(this.animateScroll);
        }
      }
  
      /**
       * Handles the touchend event
       * @param {TouchEvent} event 
       */
      handleTouchEnd(event) {
        if (!this.isTouching) return;
        this.isTouching = false;
  
        // Optional: Implement inertia or momentum scrolling here
      }
  
      /**
       * Animation loop for smooth scrolling
       * @param {number} timestamp - Current time in milliseconds
       */
      animateScroll(timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = timestamp - this.startTime;
  
        // Calculate duration based on smoothScrollFactor
        const baseDuration = 1000; // Base duration in ms
        const duration = baseDuration * (this.smoothScrollFactor / 100);
        const progress = Math.min(elapsed / duration, 1); // Progress between 0 and 1
  
        // Select the appropriate easing function
        const easingFunction = this.easingFunctions[this.easingMode];
        const easedProgress = easingFunction(progress);
  
        // Calculate the new scroll position
        this.currentScroll = this.startScroll + (this.targetScroll - this.startScroll) * easedProgress;
        this.pageWrapper.scrollTop = this.currentScroll;
  
        if (progress < 1) {
          // Continue the animation loop
          requestAnimationFrame(this.animateScroll);
        } else {
          // Animation complete
          this.currentScroll = this.targetScroll;
          this.pageWrapper.scrollTop = this.currentScroll;
          this.isAnimating = false;
        }
      }
  
      /**
       * Handles events for ScrollToggle
       * @param {Event} event 
       */
      handleEvent(event) {
        // Immediate condition check
        this.checkConditions();
  
        // Debounce to prevent excessive checks on rapid events
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          this.checkConditions();
        }, this.debounceDelay);
  
        // Start repeated condition checks until maxCheckDuration is reached
        const interval = Math.round(this.maxCheckDuration / this.numChecks); // milliseconds
  
        for (let i = 1; i <= this.numChecks; i++) {
          const timeout = interval * i;
          setTimeout(() => {
            this.checkConditions();
          }, timeout);
        }
      }
  
      /**
       * Checks the defined conditions and enables/disables scrolling accordingly
       */
      checkConditions() {
        let shouldEnableScroll = false;
        let shouldDisableScroll = false;
  
        // Iterate through each condition in conditionArray
        this.conditionArray.forEach((condition) => {
          const { conditionAttribute, conditionActive, conditionDisable } = condition;
  
          this.conditionElements.forEach((element) => {
            if (!(element instanceof Element)) {
              console.warn(`ScrollManager: Condition element is not defined or not an Element.`);
              return;
            }
  
            const computedStyle = window.getComputedStyle(element);
            const attributeValue = computedStyle.getPropertyValue(conditionAttribute).trim();
  
            // Compare current attribute values with the target values
            if (this.compareValues(attributeValue, conditionDisable)) {
              shouldDisableScroll = true;
            } else if (this.compareValues(attributeValue, conditionActive)) {
              shouldEnableScroll = true;
            }
          });
        });
  
        // Decide based on the conditions
        if (shouldDisableScroll) {
          this.disableScroll();
        } else if (shouldEnableScroll) {
          this.enableScroll();
        }
      }
  
      /**
       * Compares two values
       * @param {string} current 
       * @param {string} target 
       * @returns {boolean}
       */
      compareValues(current, target) {
        // Numerical comparison for flexibility
        const currentValue = parseFloat(current);
        const targetValue = parseFloat(target);
        return currentValue === targetValue;
      }
  
      /**
       * Observes changes to the condition elements' attributes
       */
      observeMutations() {
        const attributesToObserve = this.conditionArray.map(cond => cond.conditionAttribute);
        const config = { attributes: true, attributeFilter: attributesToObserve };
  
        this.conditionElements.forEach((element) => {
          if (element instanceof Element) {
            const observer = new MutationObserver((mutationsList) => {
              for (let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                  this.checkConditions();
                }
              }
            });
            observer.observe(element, config);
          } else {
            console.warn(`ScrollManager: Condition element is not defined or not an Element. MutationObserver not set up.`);
          }
        });
      }
    }
  
    // Make the ScrollManager class globally available
    global.ScrollManager = ScrollManager;
  })(window);