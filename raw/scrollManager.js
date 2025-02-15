/**
 * ScrollManager Class
 *
 * Enables or disables page scrolling based on specified CSS conditions and custom events,
 * and animates scrolling using easing functions.
 *
 * Options:
 * - scrollSpeed (number): Number of pixels to scroll per event. Default: 100.
 * - smoothScrollFactor (number): Factor (0-100) determining the smoothness of the scroll animation. Default: 50.
 * - pageWrapper (string): ID of the page wrapper element containing scrollable content. (Required; use an ID selector, e.g., "pagewrapper")
 * - easingMode (string): CSS easing mode for the scroll animation (e.g., "ease", "ease-in-out"). Default: "ease".
 * - checkEvent (string): Event type that triggers condition checks (e.g., "scroll", "click", "hover"). Default: "scroll".
 * - hoverTriggers (Array<string>): Array of CSS class names for elements that trigger hover events. (Optional)
 * - triggerElements (Array<string>): Array of element IDs for primary trigger events. (Optional)
 * - conditionElements (Array<string>): Array of element IDs whose CSS attributes are monitored.
 * - conditionArray (Array<Object>): Array of condition objects. Each object must include:
 *      - conditionAttribute (string): The CSS attribute to monitor.
 *      - conditionActive (string): The attribute value that enables scrolling.
 *      - conditionDisable (string): The attribute value that disables scrolling.
 * - maxCheckDuration (number): Maximum duration in milliseconds for repeated condition checks. Default: 1000.
 *
 * Example:
 *
 * new ScrollManager({
 *   scrollSpeed: 30,
 *   smoothScrollFactor: 90,
 *   pageWrapper: 'pagewrapper',
 *   easingMode: 'ease-out',
 *   checkEvent: 'click',
 *   hoverTriggers: ['hover-trigger'],
 *   conditionElements: ['menuwhite', 'menublack'],
 *   conditionArray: [
 *     { conditionAttribute: 'opacity', conditionActive: '0', conditionDisable: '1' }
 *   ],
 *   maxCheckDuration: 700
 * });
 *
 * @version 1.0.0
 * @license MIT
 */
(function(global) {
  class ScrollManager {
    constructor(options) {
      this.options = options;
      this.handleWheel = this.handleWheel.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handleEvent = this.handleEvent.bind(this);
      this.animateScroll = this.animateScroll.bind(this);

      this.debounceTimeout = null;
      this.debounceDelay = 50;

      this.scrollSpeed = options.scrollSpeed || 100;
      this.smoothScrollFactor = options.smoothScrollFactor || 50;
      this.pageWrapperId = options.pageWrapper || 'pagewrapper';
      this.easingMode = options.easingMode || 'ease';
      this.checkEvent = options.checkEvent || 'scroll';
      this.hoverTriggers = options.hoverTriggers || [];
      this.triggerElements = options.triggerElements || [];
      this.conditionElementsIDs = options.conditionElements || [];
      this.conditionArray = options.conditionArray || [];
      this.maxCheckDuration = options.maxCheckDuration || 1000;
      this.numChecks = 5;
      this.targetScroll = 0;
      this.currentScroll = 0;
      this.isAnimating = false;
      this.startScroll = 0;
      this.startTime = null;
      this.isTouching = false;
      this.touchStartY = 0;
      this.touchDeltaY = 0;
      this.isScrollingEnabled = true;

      this.easingFunctions = {
        ease: this.ease,
        'ease-in': this.easeIn,
        'ease-out': this.easeOut,
        'ease-in-out': this.easeInOut
      };

      if (!this.easingFunctions[this.easingMode]) {
        console.warn(`ScrollManager: Invalid easingMode "${this.easingMode}". Using "ease" as default.`);
        this.easingMode = 'ease';
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.init();
          this.observeMutations();
        });
      } else {
        this.init();
        this.observeMutations();
      }
    }

    ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    easeIn(t) {
      return t * t * t;
    }

    easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    init() {
      this.pageWrapper = document.getElementById(this.pageWrapperId);
      if (!this.pageWrapper) {
        console.error(`ScrollManager: Element with ID "${this.pageWrapperId}" not found.`);
        return;
      }

      document.body.style.overflow = 'hidden';
      this.pageWrapper.style.position = 'fixed';
      this.pageWrapper.style.top = '0';
      this.pageWrapper.style.left = '0';
      this.pageWrapper.style.width = '100%';
      this.pageWrapper.style.height = '100%';
      this.pageWrapper.style.overflow = 'hidden';

      this.currentScroll = this.pageWrapper.scrollTop;
      this.targetScroll = this.currentScroll;

      window.addEventListener('wheel', this.handleWheel, { passive: false });
      this.pageWrapper.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.pageWrapper.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.pageWrapper.addEventListener('touchend', this.handleTouchEnd, { passive: false });

      this.conditionElements = this.conditionElementsIDs.map((id, index) => {
        const el = document.getElementById(id);
        if (!el) {
          console.warn(`ScrollManager: Condition element at index ${index} (ID: '${id}') is not defined.`);
        }
        return el;
      });

      this.setupToggleEventListeners();
      this.checkConditions();
    }

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

    enableScroll() {
      if (!this.isScrollingEnabled) {
        this.isScrollingEnabled = true;
        document.body.style.overflow = 'hidden';
        this.pageWrapper.style.overflow = 'hidden';
      }
    }

    disableScroll() {
      if (this.isScrollingEnabled) {
        this.isScrollingEnabled = false;
        document.body.style.overflow = '';
        this.pageWrapper.style.overflow = '';
      }
    }

    handleWheel(event) {
      if (this.isScrollingEnabled) {
        event.preventDefault();
        this.targetScroll += event.deltaY > 0 ? this.scrollSpeed : -this.scrollSpeed;
        const maxScroll = this.pageWrapper.scrollHeight - window.innerHeight;
        this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.startTime = null;
          this.startScroll = this.pageWrapper.scrollTop;
          requestAnimationFrame(this.animateScroll);
        }
      }
    }

    handleTouchStart(event) {
      if (event.touches.length === 1) {
        this.isTouching = true;
        this.touchStartY = event.touches[0].clientY;
        this.touchDeltaY = 0;
      }
    }

    handleTouchMove(event) {
      if (this.isTouching && event.touches.length === 1) {
        const touchCurrentY = event.touches[0].clientY;
        this.touchDeltaY = this.touchStartY - touchCurrentY;
        this.targetScroll += this.touchDeltaY;
        const maxScroll = this.pageWrapper.scrollHeight - window.innerHeight;
        this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
        this.touchStartY = touchCurrentY;
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.startTime = null;
          this.startScroll = this.pageWrapper.scrollTop;
          requestAnimationFrame(this.animateScroll);
        }
      }
    }

    handleTouchEnd(event) {
      if (this.isTouching) {
        this.isTouching = false;
      }
    }

    animateScroll(timestamp) {
      if (!this.startTime) this.startTime = timestamp;
      const elapsed = timestamp - this.startTime;
      const baseDuration = 1000;
      const duration = baseDuration * (this.smoothScrollFactor / 100);
      const progress = Math.min(elapsed / duration, 1);
      const easingFunction = this.easingFunctions[this.easingMode];
      const easedProgress = easingFunction(progress);
      this.currentScroll = this.startScroll + (this.targetScroll - this.startScroll) * easedProgress;
      this.pageWrapper.scrollTop = this.currentScroll;
      if (progress < 1) {
        requestAnimationFrame(this.animateScroll);
      } else {
        this.currentScroll = this.targetScroll;
        this.pageWrapper.scrollTop = this.currentScroll;
        this.isAnimating = false;
      }
    }

    handleEvent(event) {
      this.checkConditions();
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.checkConditions();
      }, this.debounceDelay);
      const interval = Math.round(this.maxCheckDuration / this.numChecks);
      for (let i = 1; i <= this.numChecks; i++) {
        const timeout = interval * i;
        setTimeout(() => {
          this.checkConditions();
        }, timeout);
      }
    }

    checkConditions() {
      let shouldEnableScroll = false;
      let shouldDisableScroll = false;

      this.conditionArray.forEach(condition => {
        const { conditionAttribute, conditionActive, conditionDisable } = condition;
        this.conditionElements.forEach(element => {
          if (!(element instanceof Element)) {
            console.warn("ScrollManager: Condition element is not defined or not an Element.");
            return;
          }
          const computedStyle = window.getComputedStyle(element);
          const attributeValue = computedStyle.getPropertyValue(conditionAttribute).trim();
          if (this.compareValues(attributeValue, conditionDisable)) {
            shouldDisableScroll = true;
          } else if (this.compareValues(attributeValue, conditionActive)) {
            shouldEnableScroll = true;
          }
        });
      });

      if (shouldDisableScroll) {
        this.disableScroll();
      } else if (shouldEnableScroll) {
        this.enableScroll();
      }
    }

    compareValues(current, target) {
      const currentValue = parseFloat(current);
      const targetValue = parseFloat(target);
      return currentValue === targetValue;
    }

    observeMutations() {
      const attributesToObserve = this.conditionArray.map(cond => cond.conditionAttribute);
      const config = { attributes: true, attributeFilter: attributesToObserve };
      this.conditionElements.forEach(element => {
        if (element instanceof Element) {
          const observer = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
              if (mutation.type === "attributes") {
                this.checkConditions();
              }
            }
          });
          observer.observe(element, config);
        } else {
          console.warn("ScrollManager: Condition element is not defined or not an Element. MutationObserver not set up.");
        }
      });
    }
  }

  global.ScrollManager = ScrollManager;
})(window);
