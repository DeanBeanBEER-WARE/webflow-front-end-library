/**
 * Slider Class
 *
 * Manages slider components where a draggable dot controls a slide element's position.
 *
 * Options:
 * - sliderDotId (string): The ID of the slider dot element. (Required; expected to be an ID selector.)
 * - sliderDotParentId (string): The ID of the container for the slider dot. (Required; expected to be an ID selector.)
 * - slideElementId (string): The ID of the slide element. (Required; expected to be an ID selector.)
 * - initialPositionPercentage (number): Initial position of the slider dot as a percentage (0-100). (Required)
 * - frameRateSliderElement (number): Frame rate (FPS) for slider movement. Default: 60.
 *
 * Example:
 *
 * const sliderConfigs = [
 *   {
 *     sliderDotId: 'slider-dot-1',
 *     sliderDotParentId: 'slider-container-1',
 *     slideElementId: 'slide-1',
 *     initialPositionPercentage: 25,
 *     frameRateSliderElement: 60
 *   }
 * ];
 *
 * const sliderManager = new Slider(sliderConfigs);
 *
 * @version 1.0.0
 * @license MIT
 */
class Slider {
    constructor(configs) {
      if (!Array.isArray(configs)) {
        throw new Error("Invalid sliderConfigs parameter. Expected an array.");
      }
  
      this.sliders = configs.map(config => ({
        sliderDotId: "",
        sliderDotParentId: "",
        slideElementId: "",
        initialPositionPercentage: 0,
        frameRateSliderElement: 60,
        ...config,
        dot: null,
        parent: null,
        slide: null
      }));
  
      this.init = this.init.bind(this);
      this._ready(this.init);
  
      this.debouncedResize = this.debounce(() => {
        this.sliders.forEach(slider => {
          if (slider.dot && slider.parent && slider.slide) {
            this.updateDimensions(slider);
            this.setInitialPosition(slider, slider.dot, slider.parent, slider.slide);
          }
        });
      }, 100);
  
      window.addEventListener("resize", this.debouncedResize);
    }
  
    init() {
      this.sliders.forEach(slider => {
        const { sliderDotId, sliderDotParentId, slideElementId, initialPositionPercentage, frameRateSliderElement } = slider;
        const dotElement = document.getElementById(sliderDotId);
        const parentElement = document.getElementById(sliderDotParentId);
        const slideElement = document.getElementById(slideElementId);
  
        if (dotElement && parentElement && slideElement) {
          if (initialPositionPercentage === undefined || frameRateSliderElement === undefined) {
            console.error("Missing numerical values for initialPositionPercentage or frameRateSliderElement");
            return;
          }
  
          slider.dot = dotElement;
          slider.parent = parentElement;
          slider.slide = slideElement;
  
          Object.assign(slider, {
            isDragging: false,
            startX: 0,
            startY: 0,
            initialX: 0,
            initialY: 0,
            cursorType: ["grab", "grabbing"],
            moveListeners: [],
            endListeners: [],
            throttleTimeout: null
          });
  
          this.setCursor(dotElement, slider.cursorType[0]);
  
          ["mousedown", "touchstart"].forEach(eventType => {
            dotElement.addEventListener(eventType, (event) => this.handleStart(event, slider));
          });
  
          this.updateDimensions(slider);
          this.setInitialPosition(slider, dotElement, parentElement, slideElement);
        } else {
          console.error(`Missing or invalid IDs: ${sliderDotId}, ${sliderDotParentId}, ${slideElementId}`);
        }
      });
    }
  
    setInitialPosition(slider, dot, parent, slide) {
      const availableWidth = parent.offsetWidth - dot.offsetWidth;
      const initialPosition = (availableWidth * slider.initialPositionPercentage) / 100;
      this.updateSliderPosition(slider, initialPosition, dot, slide, parent);
    }
  
    setCursor(element, cursor) {
      element.style.cursor = cursor;
      element.style.cursor = `-webkit-${cursor}`;
    }
  
    handleStart(event, slider) {
      event.preventDefault();
      slider.isDragging = true;
      const { clientX, clientY } = event.type === "mousedown" ? event : event.touches[0];
      Object.assign(slider, {
        startX: clientX,
        startY: clientY,
        initialX: slider.dot.offsetLeft,
        initialY: slider.dot.offsetTop
      });
  
      this.setCursor(slider.dot, slider.cursorType[1]);
  
      ["mousemove", "touchmove"].forEach(eventType => {
        const moveHandler = (moveEvent) => this.throttledHandleMove(moveEvent, slider);
        document.addEventListener(eventType, moveHandler);
        slider.moveListeners.push({ evt: eventType, listener: moveHandler });
      });
  
      ["mouseup", "touchend", "touchcancel"].forEach(eventType => {
        const endHandler = () => this.handleEnd(slider);
        document.addEventListener(eventType, endHandler);
        slider.endListeners.push({ evt: eventType, listener: endHandler });
      });
    }
  
    throttledHandleMove(event, slider) {
      if (!slider.throttleTimeout) {
        slider.throttleTimeout = setTimeout(() => {
          slider.throttleTimeout = null;
          if (slider.isDragging) {
            const currentX = event.type === "mousemove"
              ? event.clientX
              : (event.touches && event.touches[0] ? event.touches[0].clientX : null);
            if (currentX === null) return;
            const deltaX = currentX - slider.startX;
            const newPosition = slider.initialX + deltaX;
            this.updateSliderPosition(slider, newPosition, slider.dot, slider.slide, slider.parent);
            if (newPosition <= 0 || newPosition + slider.dot.offsetWidth >= slider.parent.offsetWidth) {
              event.preventDefault();
            }
          }
        }, 1000 / slider.frameRateSliderElement);
      }
    }
  
    handleEnd(slider) {
      slider.isDragging = false;
      this.removeEventListeners(slider);
      this.setCursor(slider.dot, slider.cursorType[0]);
    }
  
    removeEventListeners(slider) {
      slider.moveListeners.forEach(({ evt, listener }) => {
        document.removeEventListener(evt, listener);
      });
      slider.endListeners.forEach(({ evt, listener }) => {
        document.removeEventListener(evt, listener);
      });
      slider.moveListeners = [];
      slider.endListeners = [];
      if (slider.throttleTimeout) {
        clearTimeout(slider.throttleTimeout);
        slider.throttleTimeout = null;
      }
    }
  
    updateDimensions(slider) {
      if (slider.parent && slider.dot && slider.slide) {
        slider.parentWidth = slider.parent.offsetWidth;
        slider.dotWidth = slider.dot.offsetWidth;
        slider.slideWidth = slider.slide.offsetWidth;
        slider.cardParentWidth = slider.slide.parentElement ? slider.slide.parentElement.offsetWidth : 0;
      } else {
        console.warn("One or more elements are missing during updateDimensions.");
      }
    }
  
    updateSliderPosition(slider, position, dot, slide, parent) {
      const maxDotPosition = slider.parentWidth - slider.dotWidth;
      const clampedPosition = Math.min(Math.max(position, 0), maxDotPosition);
      const slideOffset = -(clampedPosition / maxDotPosition) * (slider.slideWidth - slider.cardParentWidth);
      dot.style.left = `${clampedPosition}px`;
      slide.style.left = `${slideOffset}px`;
    }
  
    _ready(callback) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
      } else {
        callback();
      }
    }
  
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  }
  
  window.Slider = Slider;
  