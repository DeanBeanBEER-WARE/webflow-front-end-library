/**
 * ScrollBrightness Class
 *
 * Gradually adjusts the opacity of text spans based on scroll position to create a fade-in effect.
 *
 * Options:
 * - offset (number): Percentage offset (0-100) for when the scroll animation begins (default: 0).
 * - scrollTriggerClass (string): CSS class for elements that act as scroll triggers.
 * - parentClass (string): CSS class for the parent element containing the text (optional).
 * - zielKlasse (string): CSS class for target text elements to animate.
 * - initialBrightness (number): Initial opacity (default: 0.15).
 * - targetBrightness (number): Final opacity (default: 1).
 * - transitionTime (string): Transition duration (default: "0.3s").
 * - easing (string): CSS easing function (default: "ease").
 * - keyframeLength (number): Length of the scroll keyframe as a percentage (default: 100).
 * - backgroundClass (string): CSS class to apply a background image to spans (optional).
 * - background (string): CSS background image for spans (optional).
 * - fallbackMobileBackground (string): Fallback background for mobile devices (optional).
 * - linkAttribute (string): Attribute used to link scroll triggers with parent elements (optional).
 * - fixedBackground (boolean): If true, applies fixed background styling (default: false).
 *
 * Example instantiation (asynchron sicher):
 * window.addEventListener('DOMContentLoaded', () => {
 *   new ScrollBrightness({
 *     offset: 20,
 *     scrollTriggerClass: '.scroll-trigger',
 *     parentClass: '.text-container',
 *     zielKlasse: '.animated-text',
 *     initialBrightness: 0.15,
 *     targetBrightness: 1,
 *     transitionTime: '0.5s',
 *     easing: 'ease-in-out',
 *     keyframeLength: 100,
 *     backgroundClass: 'bg-text',
 *     background: 'linear-gradient(90deg, #ff7e5f, #feb47b)',
 *     fallbackMobileBackground: 'linear-gradient(90deg, #00c6ff, #0072ff)',
 *     linkAttribute: 'data-group',
 *     fixedBackground: true
 *   });
 * });
 *
 * @version 1.0.0
 * @license MIT
 */
class ScrollBrightness {
  constructor(config) {
    const allowedEasings = ['ease', 'ease-in', 'ease-out', 'ease-in-out'];
    this.configurations = Array.isArray(config) ? config : [config];
    this.isScrollTicking = false;
    this.isResizeTicking = false;
    this.isDOMContentLoaded = false;
    this.isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.groups = new Map();
  
    this.configurations.forEach((cfg, cfgIndex) => {
      if (cfg.easing && !allowedEasings.includes(cfg.easing)) {
        console.warn(`Invalid easing value '${cfg.easing}' in configuration ${cfgIndex + 1}. Using 'ease' instead.`);
        cfg.easing = 'ease';
      }
      const configuration = {
        offset: cfg.offset !== undefined ? cfg.offset : 0,
        scrollTriggerClass: cfg.scrollTriggerClass,
        parentClass: cfg.parentClass || null,
        zielKlasse: cfg.zielKlasse,
        initialBrightness: cfg.initialBrightness !== undefined ? cfg.initialBrightness : 0.15,
        targetBrightness: cfg.targetBrightness !== undefined ? cfg.targetBrightness : 1,
        transitionTime: cfg.transitionTime !== undefined ? cfg.transitionTime : '0.3s',
        easing: cfg.easing !== undefined ? cfg.easing : 'ease',
        keyframeLength: cfg.keyframeLength !== undefined ? cfg.keyframeLength : 100,
        backgroundClass: cfg.backgroundClass || null,
        background: cfg.background || null,
        fallbackMobileBackground: cfg.fallbackMobileBackground || null,
        linkAttribute: cfg.linkAttribute || null,
        fixedBackground: cfg.fixedBackground !== undefined ? cfg.fixedBackground : false,
      };
  
      if (!configuration.scrollTriggerClass || !configuration.zielKlasse) {
        console.error(`Configuration ${cfgIndex + 1}: 'scrollTriggerClass' and 'zielKlasse' are required.`);
        return;
      }
  
      this.configurations[cfgIndex] = configuration;
    });
  
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.domContentLoadedHandler = this.domContentLoadedHandler.bind(this);
  
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.domContentLoadedHandler();
    } else {
      document.addEventListener('DOMContentLoaded', this.domContentLoadedHandler);
    }
  }
  
  domContentLoadedHandler() {
    if (this.isDOMContentLoaded) return;
    this.isDOMContentLoaded = true;
    this.initElements();
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.onResize.bind(this));
    document.removeEventListener('DOMContentLoaded', this.domContentLoadedHandler);
  }
  
  onScroll() {
    if (!this.isScrollTicking) {
      requestAnimationFrame(() => {
        this.handleScroll();
        this.isScrollTicking = false;
      });
      this.isScrollTicking = true;
    }
  }
  
  onResize() {
    if (!this.isResizeTicking) {
      requestAnimationFrame(() => {
        this.handleResize();
        this.isResizeTicking = false;
      });
    }
  }
  
  initElements() {
    this.configurations.forEach((config, cfgIndex) => {
      const scrollTriggers = document.querySelectorAll(config.scrollTriggerClass);
      if (scrollTriggers.length === 0) {
        console.warn(`Configuration ${cfgIndex + 1}: No elements found with class '${config.scrollTriggerClass}'.`);
        return;
      }
      const parents = document.querySelectorAll(config.parentClass || config.zielKlasse);
      if (parents.length === 0) {
        console.warn(`Configuration ${cfgIndex + 1}: No elements found with class '${config.parentClass || config.zielKlasse}'.`);
        return;
      }
  
      scrollTriggers.forEach((trigger, index) => {
        let parent = null;
        if (config.linkAttribute) {
          const triggerAttrValue = trigger.getAttribute(config.linkAttribute);
          if (!triggerAttrValue) {
            console.warn(`Configuration ${cfgIndex + 1}, Trigger ${index + 1}: Attribute '${config.linkAttribute}' not defined.`);
            return;
          }
          parent = Array.from(parents).find(p => p.getAttribute(config.linkAttribute) === triggerAttrValue);
          if (!parent) {
            console.warn(`Configuration ${cfgIndex + 1}, Trigger ${index + 1}: No parent element with '${config.linkAttribute}="${triggerAttrValue}"' found.`);
            return;
          }
        } else {
          parent = parents[index];
          if (!parent) {
            console.warn(`Configuration ${cfgIndex + 1}, Trigger ${index + 1}: No corresponding parent element found.`);
            return;
          }
        }
  
        const targets = parent.querySelectorAll(config.zielKlasse);
        if (targets.length === 0) {
          console.warn(`Configuration ${cfgIndex + 1}, Parent ${index + 1}: No target elements with class '${config.zielKlasse}' found.`);
          return;
        }
  
        const groupData = {
          trigger: trigger,
          parent: parent,
          config: config,
          totalWordsInGroup: 0,
          targets: [],
          lastClampedProgress: -1,
        };
  
        targets.forEach(target => {
          this.prepareTarget(target, config);
          const hasBackgroundClass = config.backgroundClass ? target.classList.contains(config.backgroundClass) : false;
          const backgroundValue = hasBackgroundClass
            ? (this.isMobile && config.fallbackMobileBackground ? config.fallbackMobileBackground : config.background)
            : null;
          const words = this.wrapWords(target, config, hasBackgroundClass, backgroundValue);
          groupData.totalWordsInGroup += words.length;
          groupData.targets.push({
            element: target,
            words: words,
            hasBackgroundClass: hasBackgroundClass,
            backgroundValue: backgroundValue,
            wordStartIndex: groupData.totalWordsInGroup - words.length,
            lastWordsToLight: -1,
          });
        });
  
        this.groups.set(trigger, groupData);
      });
    });
    this.handleScroll();
  }
  
  prepareTarget(element, config) {
    element.style.transition = `opacity ${config.transitionTime} ${config.easing}`;
    element.style.opacity = '1';
  }
  
  wrapWords(element, config, hasBackgroundClass, backgroundValue) {
    const text = element.textContent;
    element.textContent = '';
    const words = [];
    const wordsArray = text.split(' ');
  
    wordsArray.forEach((word, index) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.opacity = config.initialBrightness;
      span.style.transition = `opacity ${config.transitionTime} ${config.easing}`;
      if (hasBackgroundClass && backgroundValue) {
        span.style.backgroundImage = backgroundValue;
        span.style.webkitBackgroundClip = 'text';
        span.style.backgroundClip = 'text';
        span.style.color = 'transparent';
        if (config.fixedBackground) {
          span.style.backgroundPosition = 'center center';
          span.style.backgroundAttachment = 'fixed';
          span.style.backgroundSize = 'cover';
        }
      }
      element.appendChild(span);
      words.push(span);
      if (index < wordsArray.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
  
    return words;
  }
  
  handleScroll() {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    this.groups.forEach(groupData => {
      const { trigger, parent, config, totalWordsInGroup } = groupData;
      const triggerRect = trigger.getBoundingClientRect();
      const triggerHeight = triggerRect.height;
      const offsetPx = (config.offset / 100) * triggerHeight;
      const viewportBottom = windowHeight;
      const progress = ((viewportBottom - triggerRect.top - offsetPx) / triggerHeight) * 100;
      const clampedProgress = Math.max(0, Math.min(100, progress));
  
      if (clampedProgress === groupData.lastClampedProgress) return;
      groupData.lastClampedProgress = clampedProgress;
      const totalWordsToLight = Math.floor((clampedProgress / 100) * totalWordsInGroup);
  
      groupData.targets.forEach(item => {
        const { words, wordStartIndex } = item;
        const wordsInThisTarget = words.length;
        const wordsToLightInThisTarget = Math.max(0, Math.min(wordsInThisTarget, totalWordsToLight - wordStartIndex));
        if (wordsToLightInThisTarget !== item.lastWordsToLight) {
          item.lastWordsToLight = wordsToLightInThisTarget;
          words.forEach((span, index) => {
            span.style.opacity = (index < wordsToLightInThisTarget) ? config.targetBrightness : config.initialBrightness;
          });
        }
      });
    });
  }
  
  handleResize() {
    this.groups.forEach(groupData => {
      groupData.lastClampedProgress = -1;
    });
    this.handleScroll();
  }
}
window.ScrollBrightness = ScrollBrightness;
