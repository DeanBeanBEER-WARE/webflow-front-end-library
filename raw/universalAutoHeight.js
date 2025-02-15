/**
 * ToggleHeight Class
 *
 * Enables smooth toggling of element height (e.g., for FAQs, accordions) with configurable triggers, targets,
 * optional rotation elements, and customizable transition options.
 *
 * Options:
 * - parentSelector (string): CSS selector for the container of trigger and target elements. (Optional)
 * - triggerSelector (string): CSS selector for the element that triggers the toggle. (Required)
 * - targetSelector (string): CSS selector for the element whose height will be toggled. (Required)
 * - rotateSelector (string): CSS selector for an element to rotate during toggling (e.g., an arrow icon). (Optional)
 * - isOpen (boolean): Whether the target should be open by default. Default: false.
 * - duration (number): Transition duration in milliseconds. Default: 300.
 * - closeOthers (boolean): If true, opening one target closes others in the same group. Default: true.
 * - easingMode (string): CSS easing function for transitions. Default: 'ease'.
 * - fontSizeMultiplier (number): Multiplier for calculating the collapsed height based on the root font size. Default: 1.
 * - expandedRotation (number): Rotation angle in degrees when the target is expanded. Default: 90.
 *
 * Example:
 *
 * const toggleConfigs = [
 *   {
 *     parentSelector: '.faq-container',
 *     triggerSelector: '.faq-question',
 *     targetSelector: '.faq-answer',
 *     rotateSelector: '.faq-icon',
 *     isOpen: false,
 *     duration: 300,
 *     closeOthers: true,
 *     easingMode: 'ease-in-out',
 *     fontSizeMultiplier: 1,
 *     expandedRotation: 90
 *   }
 * ];
 *
 * const toggleHeight = new ToggleHeight(toggleConfigs);
 *
 * @version 1.0.0
 * @license MIT
 */
class ToggleHeight {
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
        expandedRotation: config.expandedRotation !== undefined ? config.expandedRotation : 90
      }));
  
      this.domContentLoadedHandler = this.domContentLoadedHandler.bind(this);
      document.addEventListener('DOMContentLoaded', this.domContentLoadedHandler);
    }
  
    getRootFontSize() {
      const fontSizeStr = window.getComputedStyle(document.documentElement).fontSize;
      return parseFloat(fontSizeStr);
    }
  
    getCollapsedHeight(config) {
      const rootFontSize = this.getRootFontSize();
      const collapsedHeight = rootFontSize * config.fontSizeMultiplier;
      return `${collapsedHeight}px`;
    }
  
    domContentLoadedHandler() {
      this.configs.forEach(config => this.initConfig(config));
      document.removeEventListener('DOMContentLoaded', this.domContentLoadedHandler);
      this.onWindowResize = this.onWindowResize.bind(this);
      window.addEventListener('resize', this.onWindowResize);
    }
  
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
        expandedRotation = 90
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
      config.expandedRotation = expandedRotation;
  
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
  
    initElement(element, config) {
      element.style.overflow = 'hidden';
      element.style.transition = `height ${config.duration}ms ${config.easingMode}`;
      if (config.isOpen) {
        element.style.height = `${element.scrollHeight}px`;
      } else {
        element.style.height = this.getCollapsedHeight(config);
      }
    }
  
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
  
    expand(target, rotateElement, config) {
      target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
      target.style.height = `${target.scrollHeight}px`;
      if (rotateElement) {
        this.rotate(rotateElement, config.expandedRotation, config.duration, config.easingMode);
      }
    }
  
    collapse(target, rotateElement, config) {
      target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
      target.style.height = this.getCollapsedHeight(config);
      if (rotateElement) {
        this.rotate(rotateElement, 0, config.duration, config.easingMode);
      }
    }
  
    rotate(element, degrees, duration, easingMode) {
      element.style.transition = `transform ${duration}ms ${easingMode}`;
      element.style.transform = `rotate(${degrees}deg)`;
    }
  
    onWindowResize() {
      this.configs.forEach(config => {
        const newCollapsedHeight = this.getCollapsedHeight(config);
        config.targets.forEach((target, index) => {
          const rotateElement = config.rotateElements[index] || null;
          const isOpen = parseFloat(target.style.height) > parseFloat(newCollapsedHeight);
          if (isOpen) {
            const originalTransition = target.style.transition;
            target.style.transition = 'none';
            target.style.height = `${target.scrollHeight}px`;
            target.offsetHeight;
            target.style.transition = originalTransition;
          } else {
            target.style.transition = "height 0ms";
            target.style.height = newCollapsedHeight;
            target.offsetHeight;
            target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
          }
        });
      });
    }
  }
  
  window.ToggleHeight = ToggleHeight;
  