/**
 * ComboClassConfigurator Class
 *
 * Manages dynamic addition and removal of CSS classes on DOM elements based on user interactions.
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
    const supportedEasings = ["ease", "ease-in", "ease-out", "ease-in-out"];
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
      parentAttribute: "",
      callback: null,
      classesAdded: false,
      start: 1,
      end: 0,
      frequency: 1,
      addClasses: [],
      removeClasses: [],
      topAddClasses: []
    };
  
    this.initialConfigs.forEach(config => {
      const mergedConfig = { ...defaultConfig, ...config };
      mergedConfig.easingMode = supportedEasings.includes(mergedConfig.easingMode)
        ? mergedConfig.easingMode
        : defaultConfig.easingMode;
      mergedConfig.entryThreshold = this._validateThreshold(mergedConfig.entryThreshold, defaultConfig.entryThreshold);
      mergedConfig.exitThreshold = this._validateThreshold(mergedConfig.exitThreshold, defaultConfig.exitThreshold);
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
  
  _validateThreshold(value, defaultValue) {
    return (typeof value === "number" && value >= 0 && value <= 100) ? value : defaultValue;
  }
  
  _cleanClasses(classes) {
    return Array.isArray(classes)
      ? classes.map(cls => cls.replace(".", "").trim()).filter(Boolean)
      : [];
  }
  
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
        if (!once) {
          this._initClasses(config, "remove");
          config.classesAdded = false;
          if (config.callback) {
            config.callback(triggerElement || null, "remove");
          }
        }
      }, debounceDelay);
  
      const handler = eventHandlers.get(eventName);
      if (handler) {
        handler(triggerElement, config, addClassesDebounced, removeClassesDebounced, this._calculateThresholds(entryThreshold, exitThreshold));
      } else {
        this._applyImmediateClasses(config);
      }
    });
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
  
  _handleClick(element, config, addCallback, removeCallback, thresholds) {
    element.addEventListener("click", () => {
      const action = config.classesAdded ? "remove" : "add";
      action === "add" ? addCallback() : removeCallback();
      config.classesAdded = !config.classesAdded;
      if (config.callback) {
        config.callback(element, action);
      }
    });
  }
  
  _handleHover(element, config, addCallback, removeCallback, thresholds) {
    if (config.switchAction) {
      element.addEventListener("mouseenter", removeCallback);
      element.addEventListener("mouseleave", addCallback);
    } else {
      element.addEventListener("mouseenter", addCallback);
      element.addEventListener("mouseleave", removeCallback);
    }
  }
  
  _handleScrollInView(element, config, addCallback, removeCallback, thresholds) {
    const observerConfig = JSON.stringify({
      threshold: thresholds.sort(),
      root: null,
      rootMargin: "0px"
    });
  
    let observer = this.scrollObservers.get(observerConfig);
    if (!observer) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const target = entry.target;
          const configs = target.__comboClassConfigs || [];
          configs.forEach(conf => {
            const { switchAction, entryThreshold, exitThreshold, debouncedInit, debouncedRemove, topAddClasses } = conf;
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
      }, { threshold: thresholds });
      this.scrollObservers.set(observerConfig, observer);
    }
  
    if (!element.__comboClassConfigs) {
      element.__comboClassConfigs = [];
      observer.observe(element);
    }
    element.__comboClassConfigs.push({
      ...config,
      debouncedInit: addCallback,
      debouncedRemove: removeCallback
    });
  
    if (config.once) {
      config.callback = config.callback
        ? (el, action) => {
            config.callback(el, action);
            if (action === "remove") {
              observer.unobserve(el);
              el.__comboClassConfigs.splice(el.__comboClassConfigs.indexOf(config), 1);
            }
          }
        : null;
    }
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

function getElement(selectorOrId) {
  if (!selectorOrId) return null;
  return selectorOrId.startsWith(".")
    ? document.querySelector(selectorOrId)
    : document.getElementById(selectorOrId);
}

window.ComboClassConfigurator = ComboClassConfigurator;
