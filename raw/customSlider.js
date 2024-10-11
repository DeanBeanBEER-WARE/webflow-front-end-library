/**
 * Slider Class
 * 
 * This class manages slider components on the webpage. Each slider consists of a draggable dot
 * that controls the position of corresponding slide elements. The class handles user interactions
 * such as dragging, touch events, and window resizing to ensure smooth and responsive slider behavior.
 */
class Slider {
    /**
     * Constructs a new Slider instance.
     * 
     * @param {Array<Object>} configs - An array of configuration objects for each slider.
     * @throws {Error} Throws an error if the provided configurations are not an array.
     */
    constructor(configs) {
        // Validate that the provided configurations are an array
        if (!Array.isArray(configs)) {
            throw new Error("Invalid sliderConfigs parameter. Expected an array.");
        }

        /**
         * @type {Array<Object>}
         * @description Array to hold slider configurations with default values and additional properties.
         */
        this.sliders = configs.map(config => ({
            // Default configuration values
            sliderDotId: "",
            sliderDotParentId: "",
            slideElementId: "",
            initialPositionPercentage: 0,
            frameRateSliderElement: 60,
            // Override defaults with provided config
            ...config,
            // Additional properties to be initialized later
            dot: null,
            parent: null,
            slide: null
        }));

        // Bind the init method to ensure correct context
        this.init = this.init.bind(this);

        // Initialize sliders when the DOM is ready
        this._ready(this.init);

        /**
         * @type {Function}
         * @description Debounced resize handler to update slider dimensions and positions.
         */
        this.debouncedResize = this.debounce(() => {
            this.sliders.forEach(slider => {
                if (slider.dot && slider.parent && slider.slide) {
                    this.updateDimensions(slider);
                    this.setInitialPosition(slider, slider.dot, slider.parent, slider.slide);
                }
            });
        }, 100);

        // Add event listener for window resize to handle responsive behavior
        window.addEventListener("resize", this.debouncedResize);
    }

    /**
     * Initializes each slider by setting up DOM elements and event listeners.
     * 
     * @private
     */
    init() {
        this.sliders.forEach(slider => {
            const {
                sliderDotId,
                sliderDotParentId,
                slideElementId,
                initialPositionPercentage,
                frameRateSliderElement
            } = slider;

            // Select DOM elements based on provided IDs
            const dotElement = document.getElementById(sliderDotId);
            const parentElement = document.getElementById(sliderDotParentId);
            const slideElement = document.getElementById(slideElementId);

            // Validate the existence of required DOM elements and configuration values
            if (dotElement && parentElement && slideElement) {
                if (initialPositionPercentage === undefined || frameRateSliderElement === undefined) {
                    console.error("Missing numerical values for initialPositionPercentage or frameRateSliderElement");
                    return;
                }

                // Assign DOM elements to the slider configuration
                slider.dot = dotElement;
                slider.parent = parentElement;
                slider.slide = slideElement;

                // Initialize additional properties for interaction handling
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

                // Set the initial cursor style
                this.setCursor(dotElement, slider.cursorType[0]);

                // Add event listeners for mouse and touch start events
                ["mousedown", "touchstart"].forEach(eventType => {
                    const handler = (event) => this.handleStart(event, slider);
                    dotElement.addEventListener(eventType, handler);
                });

                // Update slider dimensions and set the initial position
                this.updateDimensions(slider);
                this.setInitialPosition(slider, dotElement, parentElement, slideElement);
            } else {
                console.error(`Missing or invalid IDs: ${sliderDotId}, ${sliderDotParentId}, ${slideElementId}`);
            }
        });
    }

    /**
     * Sets the initial position of the slider dot and corresponding slide element based on the initial percentage.
     * 
     * @param {Object} slider - The slider configuration object.
     * @param {HTMLElement} dot - The slider dot element.
     * @param {HTMLElement} parent - The parent container of the slider dot.
     * @param {HTMLElement} slide - The slide element controlled by the slider.
     * @private
     */
    setInitialPosition(slider, dot, parent, slide) {
        const availableWidth = parent.offsetWidth - dot.offsetWidth;
        const initialPosition = availableWidth * slider.initialPositionPercentage / 100;
        this.updateSliderPosition(slider, initialPosition, dot, slide, parent);
    }

    /**
     * Sets the cursor style for a given element.
     * 
     * @param {HTMLElement} element - The element to style.
     * @param {string} cursor - The cursor style to apply (e.g., "grab", "grabbing").
     * @private
     */
    setCursor(element, cursor) {
        element.style.cursor = cursor;
        element.style.cursor = `-webkit-${cursor}`;
    }

    /**
     * Handles the start of a drag or touch event on the slider dot.
     * 
     * @param {Event} event - The event object from the interaction.
     * @param {Object} slider - The slider configuration object.
     * @private
     */
    handleStart(event, slider) {
        event.preventDefault();
        slider.isDragging = true;

        // Determine the initial touch or mouse coordinates
        const { clientX, clientY } = event.type === "mousedown" ? event : event.touches[0];

        // Record the starting positions
        Object.assign(slider, {
            startX: clientX,
            startY: clientY,
            initialX: slider.dot.offsetLeft,
            initialY: slider.dot.offsetTop
        });

        // Change cursor to indicate dragging
        this.setCursor(slider.dot, slider.cursorType[1]);

        // Add move event listeners with throttling
        ["mousemove", "touchmove"].forEach(eventType => {
            const moveHandler = (moveEvent) => this.throttledHandleMove(moveEvent, slider);
            document.addEventListener(eventType, moveHandler);
            slider.moveListeners.push({ evt: eventType, listener: moveHandler });
        });

        // Add end event listeners to handle the end of dragging
        ["mouseup", "touchend", "touchcancel"].forEach(eventType => {
            const endHandler = () => this.handleEnd(slider);
            document.addEventListener(eventType, endHandler);
            slider.endListeners.push({ evt: eventType, listener: endHandler });
        });
    }

    /**
     * Handles the movement during a drag or touch event with throttling based on the frame rate.
     * 
     * @param {Event} event - The move event object.
     * @param {Object} slider - The slider configuration object.
     * @private
     */
    throttledHandleMove(event, slider) {
        if (!slider.throttleTimeout) {
            slider.throttleTimeout = setTimeout(() => {
                slider.throttleTimeout = null;

                if (slider.isDragging) {
                    // Determine the current X position based on the event type
                    const currentX = event.type === "mousemove"
                        ? event.clientX
                        : event.touches && event.touches[0]
                            ? event.touches[0].clientX
                            : null;

                    if (currentX === null) return;

                    // Calculate the movement delta and new position
                    const deltaX = currentX - slider.startX;
                    const newPosition = slider.initialX + deltaX;

                    // Update the slider position
                    this.updateSliderPosition(slider, newPosition, slider.dot, slider.slide, slider.parent);

                    // Prevent default behavior if the slider is at the bounds
                    if (newPosition <= 0 || newPosition + slider.dot.offsetWidth >= slider.parent.offsetWidth) {
                        event.preventDefault();
                    }
                }
            }, 1000 / slider.frameRateSliderElement);
        }
    }

    /**
     * Handles the end of a drag or touch event on the slider dot.
     * 
     * @param {Object} slider - The slider configuration object.
     * @private
     */
    handleEnd(slider) {
        slider.isDragging = false;
        this.removeEventListeners(slider);
        this.setCursor(slider.dot, slider.cursorType[0]);
    }

    /**
     * Removes all event listeners associated with a slider after dragging ends.
     * 
     * @param {Object} slider - The slider configuration object.
     * @private
     */
    removeEventListeners(slider) {
        // Remove move event listeners
        slider.moveListeners.forEach(({ evt, listener }) => {
            document.removeEventListener(evt, listener);
        });

        // Remove end event listeners
        slider.endListeners.forEach(({ evt, listener }) => {
            document.removeEventListener(evt, listener);
        });

        // Clear the listeners arrays
        slider.moveListeners = [];
        slider.endListeners = [];

        // Clear any pending throttle timeout
        if (slider.throttleTimeout) {
            clearTimeout(slider.throttleTimeout);
            slider.throttleTimeout = null;
        }
    }

    /**
     * Updates the dimensions of the slider elements based on the current DOM state.
     * 
     * @param {Object} slider - The slider configuration object.
     * @private
     */
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

    /**
     * Updates the position of the slider dot and the corresponding slide element.
     * 
     * @param {Object} slider - The slider configuration object.
     * @param {number} position - The new position for the slider dot in pixels.
     * @param {HTMLElement} dot - The slider dot element.
     * @param {HTMLElement} slide - The slide element controlled by the slider.
     * @param {HTMLElement} parent - The parent container of the slider dot.
     * @private
     */
    updateSliderPosition(slider, position, dot, slide, parent) {
        const maxDotPosition = slider.parentWidth - slider.dotWidth;
        const clampedPosition = Math.min(Math.max(position, 0), maxDotPosition);
        const slideOffset = -(clampedPosition / maxDotPosition) * (slider.slideWidth - slider.cardParentWidth);

        // Update the CSS left property to move the dot and slide elements
        dot.style.left = `${clampedPosition}px`;
        slide.style.left = `${slideOffset}px`;
    }

    /**
     * Executes a callback function when the DOM is fully loaded and ready.
     * 
     * @param {Function} callback - The function to execute once the DOM is ready.
     * @private
     */
    _ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    /**
     * Creates a debounced version of a function that delays its execution until after a specified wait time has elapsed since the last time it was invoked.
     * 
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The number of milliseconds to delay.
     * @returns {Function} A new debounced function.
     * @private
     */
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

// Expose the Slider class to the global window object for external access
window.Slider = Slider;

/*
 * Documentation
 * 
 * Slider Class
 * 
 * - Purpose: Manages multiple slider components on the webpage, handling user interactions and responsive behavior.
 * - Constructor Parameters:
 *   - configs (Array<Object>): An array where each object contains configuration options for a slider.
 *     - sliderDotId (string, required): The DOM element ID for the slider dot.
 *     - sliderDotParentId (string, required): The DOM element ID for the parent container of the slider dot.
 *     - slideElementId (string, required): The DOM element ID for the slide element controlled by the slider.
 *     - initialPositionPercentage (number, optional): The initial position of the slider dot as a percentage of the available width. Default is 0.
 *     - frameRateSliderElement (number, optional): The frame rate for the slider movement. Default is 60.
 *     - Additional properties can be added as needed.
 * 
 * Methods:
 * 
 * - init():
 *     - Description: Initializes each slider by selecting DOM elements, setting initial positions, and adding event listeners.
 *     - Parameters: None
 *     - Returns: void
 * 
 * - setInitialPosition(slider, dot, parent, slide):
 *     - Description: Calculates and sets the initial position of the slider dot and slide element based on the initial percentage.
 *     - Parameters:
 *         - slider (Object): The slider configuration object.
 *         - dot (HTMLElement): The slider dot element.
 *         - parent (HTMLElement): The parent container of the slider dot.
 *         - slide (HTMLElement): The slide element controlled by the slider.
 *     - Returns: void
 * 
 * - setCursor(element, cursor):
 *     - Description: Sets the cursor style for a given element.
 *     - Parameters:
 *         - element (HTMLElement): The element to style.
 *         - cursor (string): The cursor style to apply (e.g., "grab", "grabbing").
 *     - Returns: void
 * 
 * - handleStart(event, slider):
 *     - Description: Handles the start of a drag or touch event on the slider dot, initializing drag state and adding move/end listeners.
 *     - Parameters:
 *         - event (Event): The event object from the interaction.
 *         - slider (Object): The slider configuration object.
 *     - Returns: void
 * 
 * - throttledHandleMove(event, slider):
 *     - Description: Handles the movement during a drag or touch event with throttling based on the frame rate.
 *     - Parameters:
 *         - event (Event): The move event object.
 *         - slider (Object): The slider configuration object.
 *     - Returns: void
 * 
 * - handleEnd(slider):
 *     - Description: Handles the end of a drag or touch event, resetting drag state and removing event listeners.
 *     - Parameters:
 *         - slider (Object): The slider configuration object.
 *     - Returns: void
 * 
 * - removeEventListeners(slider):
 *     - Description: Removes all move and end event listeners associated with a slider after dragging ends.
 *     - Parameters:
 *         - slider (Object): The slider configuration object.
 *     - Returns: void
 * 
 * - updateDimensions(slider):
 *     - Description: Updates the dimensions of the slider elements based on the current DOM state.
 *     - Parameters:
 *         - slider (Object): The slider configuration object.
 *     - Returns: void
 * 
 * - updateSliderPosition(slider, position, dot, slide, parent):
 *     - Description: Updates the position of the slider dot and the corresponding slide element.
 *     - Parameters:
 *         - slider (Object): The slider configuration object.
 *         - position (number): The new position for the slider dot in pixels.
 *         - dot (HTMLElement): The slider dot element.
 *         - slide (HTMLElement): The slide element controlled by the slider.
 *         - parent (HTMLElement): The parent container of the slider dot.
 *     - Returns: void
 * 
 * - _ready(callback):
 *     - Description: Executes a callback function when the DOM is fully loaded and ready.
 *     - Parameters:
 *         - callback (Function): The function to execute once the DOM is ready.
 *     - Returns: void
 * 
 * - debounce(func, wait):
 *     - Description: Creates a debounced version of a function that delays its execution until after a specified wait time has elapsed since the last time it was invoked.
 *     - Parameters:
 *         - func (Function): The function to debounce.
 *         - wait (number): The number of milliseconds to delay.
 *     - Returns: Function - A new debounced function.
 * 
 * Usage Example
 * 
 * ```javascript
 * const sliderConfigs = [
 *     {
 *         sliderDotId: 'slider-dot-1',
 *         sliderDotParentId: 'slider-container-1',
 *         slideElementId: 'slide-1',
 *         initialPositionPercentage: 25,
 *         frameRateSliderElement: 60
 *     },
 *     {
 *         sliderDotId: 'slider-dot-2',
 *         sliderDotParentId: 'slider-container-2',
 *         slideElementId: 'slide-2',
 *         initialPositionPercentage: 50,
 *         frameRateSliderElement: 30
 *     }
 * ];
 * 
 * // Initialize the Slider with the provided configurations
 * const sliderManager = new Slider(sliderConfigs);
 * ```
 * 
 * In this example:
 * 
 * - Two sliders are initialized with different configurations.
 * - Each slider has its own dot, parent container, and slide element.
 * - The initial position of each slider dot is set as a percentage of the available width.
 * - Different frame rates are set for smoother or more performance-friendly animations.
 * 
 * Notes:
 * 
 * - Ensure that the provided DOM element IDs (`sliderDotId`, `sliderDotParentId`, `slideElementId`) exist in the HTML.
 * - The `frameRateSliderElement` controls how frequently the slider updates during dragging. Higher values result in smoother movement but may impact performance.
 * - The `initialPositionPercentage` should be a value between 0 and 100 to represent the initial position relative to the slider's width.
 * - The class handles both mouse and touch events for compatibility with desktop and mobile devices.
 * - The `debouncedResize` method ensures that slider dimensions and positions are updated efficiently when the window is resized.
 */