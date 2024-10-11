/**
 * Constructs a Typewriter instance.
 * @param {Object} options - Configuration options for the typewriter.
 * @param {string} options.hTag - The heading tag to use (h1-h6).
 * @param {string} options.addClass - Additional class(es) to add to the text element.
 * @param {string[]} options.textArray - Array of texts to iterate through.
 * @param {string} options.targetParent - ID of the element to append the typewriter to.
 * @param {boolean} [options.randomText=false] - If true, selects texts randomly without immediate repetition.
 * @param {number} [options.caretFrequency=1000] - Blink frequency of the caret in milliseconds.
 * @param {number} [options.endHold=2000] - Time to hold the text before deleting in milliseconds.
 * @param {number} [options.startHold=500] - Time to wait after deleting before typing the next text in milliseconds.
 * @param {number} [options.characterHold=200] - Time between typing each character in milliseconds.
 * @param {number} [options.deleteHold=100] - Time between deleting each character in milliseconds.
 * @param {string} [options.caretClass] - Additional class(es) to add to the caret element.
 * @throws Will throw an error if required parameters are missing.
 */
/*
 * Typewriter Class
 * Creates a typewriter effect on a specified HTML element with customizable options.
 */
class Typewriter {
    /**
     * Static counter to ensure unique keyframe names for multiple instances.
     */
    static instanceCounter = 0;
    constructor(options) {
        // Increment the instance counter for unique keyframes
        Typewriter.instanceCounter += 1;
        this.instanceId = Typewriter.instanceCounter;

        // Destructure and assign options with default values
        const {
            hTag,
            addClass,
            textArray,
            targetParent,
            randomText = false,
            caretFrequency = 1000,
            endHold = 2000,
            startHold = 500,
            characterHold = 200,
            deleteHold = 100,
            caretClass // New optional parameter
        } = options;

        // Store options for later initialization
        this.options = {
            hTag,
            addClass,
            textArray,
            targetParent,
            randomText,
            caretFrequency,
            endHold,
            startHold,
            characterHold,
            deleteHold,
            caretClass
        };

        // Initialize typewriter state
        this.loopNum = 0;
        this.isDeleting = false;
        this.txt = '';
        this.currentText = '';
        this.previousTextIndex = -1; // To track previous text in random mode

        // Bind the initialization method to ensure correct 'this' context
        this._init = this._init.bind(this);

        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            // DOM not ready, add event listener
            document.addEventListener('DOMContentLoaded', this._init);
        } else {
            // DOM already loaded, initialize immediately
            this._init();
        }
    }

    /**
     * Initializes the Typewriter instance by validating options and creating elements.
     * @private
     */
    _init() {
        // Destructure stored options
        const {
            hTag,
            addClass,
            textArray,
            targetParent,
            randomText,
            caretFrequency,
            endHold,
            startHold,
            characterHold,
            deleteHold,
            caretClass
        } = this.options;

        // Validate required parameters
        if (!addClass) {
            throw new Error("Typewriter Error: 'addClass' is required.");
        }
        if (!targetParent) {
            throw new Error("Typewriter Error: 'targetParent' is required.");
        }
        if (!textArray || !Array.isArray(textArray) || textArray.length === 0) {
            throw new Error("Typewriter Error: 'textArray' must be a non-empty array.");
        }

        // Assign properties
        this.hTag = /^h[1-6]$/.test(hTag) ? hTag : 'h1';
        this.addClass = addClass;
        this.textArray = textArray.slice(); // Clone to prevent external mutations
        this.targetParent = document.getElementById(targetParent);
        if (!this.targetParent) {
            throw new Error(`Typewriter Error: No element found with id '${targetParent}'.`);
        }
        this.randomText = randomText;
        this.caretFrequency = caretFrequency;
        this.endHold = endHold;
        this.startHold = startHold;
        this.characterHold = characterHold;
        this.deleteHold = deleteHold;
        this.caretClass = caretClass; // Assign the optional caretClass

        // Create the typewriter elements
        this._createElements();

        // Start the typewriter effect
        this.tick();
    }

    /**
     * Creates and appends the necessary HTML elements for the typewriter effect.
     * Also injects dynamic CSS for the cursor blinking based on caretFrequency.
     * @private
     */
    _createElements() {
        // Create the heading element
        this.headingElement = document.createElement(this.hTag);
        this.headingElement.classList.add(this.addClass, 'typewriter-text');

        // Create the wrap span for the cursor
        this.wrapSpan = document.createElement('span');
        this.wrapSpan.classList.add('typewriter-wrap');
        if (this.caretClass) {
            this.wrapSpan.classList.add(this.caretClass);
        }

        // Append the wrap span to the heading
        this.headingElement.appendChild(this.wrapSpan);

        // Append the heading to the target parent
        this.targetParent.appendChild(this.headingElement);

        // Create and append dynamic CSS for the cursor blink animation
        const style = document.createElement('style');
        style.type = 'text/css';
        const keyframes = `
            @keyframes blink-caret-${this.instanceId} {
                0%, 50% { border-right-color: #fff; }
                50.01%, 100% { border-right-color: transparent; }
            }
        `;
        style.innerHTML = `
            ${keyframes}
            .typewriter-wrap {
                animation: blink-caret-${this.instanceId} ${this.caretFrequency}ms step-end infinite;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Selects the next text to display based on the randomText flag.
     * @returns {string} The selected text.
     * @private
     */
    _getNextText() {
        if (this.randomText) {
            if (this.textArray.length === 1) {
                return this.textArray[0];
            }
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * this.textArray.length);
            } while (nextIndex === this.previousTextIndex);
            this.previousTextIndex = nextIndex;
            return this.textArray[nextIndex];
        } else {
            // Sequential selection
            const index = this.loopNum % this.textArray.length;
            return this.textArray[index];
        }
    }

    /**
     * Performs a single tick of the typewriter effect.
     * @private
     */
    tick() {
        // Determine the current text to type
        if (!this.currentText) {
            this.currentText = this._getNextText();
        }

        // Calculate the display text
        if (this.isDeleting) {
            this.txt = this.currentText.substring(0, this.txt.length - 1);
        } else {
            this.txt = this.currentText.substring(0, this.txt.length + 1);
        }

        // Update the DOM
        this.wrapSpan.textContent = this.txt;

        // Determine the delay until the next tick
        let delta = this.isDeleting ? this.deleteHold : this.characterHold;

        if (!this.isDeleting && this.txt === this.currentText) {
            // Finished typing the current text
            delta = this.endHold;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            // Finished deleting the current text
            this.isDeleting = false;
            this.loopNum++;
            this.currentText = '';
            delta = this.startHold;
        }

        // Schedule the next tick
        setTimeout(() => this.tick(), delta);
    }
}

// Example Usage:
// Ensure the target parent exists in the HTML
// <div id="typewriter-container"></div>

// Instantiate the Typewriter class with desired options
new Typewriter({
    hTag: 'h2', // Optional: Defaults to 'h1' if not provided
    addClass: 'typewriter-style', // Required
    textArray: ["Progress is made", "Stay tuned"], // Required
    targetParent: 'typeparent', // Required
    randomText: true, // Optional: Defaults to false
    caretFrequency: 500, // Optional: Defaults to 1000ms
    endHold: 3000, // Optional: Defaults to 2000ms
    startHold: 1000, // Optional: Defaults to 500ms
    characterHold: 150, // Optional: Defaults to 200ms
    deleteHold: 100, // Optional: Defaults to 100ms
    caretClass: 'caret' // Optional: Additional class for the caret
});

/**
 * Documentation:
 * 
 * Typewriter Class Options:
 * 
 * - hTag (string): The heading tag to use for the text element (e.g., 'h1', 'h2', ..., 'h6'). Defaults to 'h1' if not a valid heading tag.
 * 
 * - addClass (string): Additional class(es) to add to the text element for styling purposes. **Required**.
 * 
 * - textArray (string[]): An array of strings that the typewriter will iterate through. Must contain at least one string. **Required**.
 * 
 * - targetParent (string): The ID of the parent HTML element where the typewriter will be appended. **Required**.
 * 
 * - randomText (boolean): If set to `true`, the texts in `textArray` will be selected randomly without immediate repetition. If `false`, texts are displayed sequentially from the array. Defaults to `false`.
 * 
 * - caretFrequency (number): The duration in milliseconds for the caret's blink animation cycle (visible and invisible). For example, `500` ms means the caret will toggle every 500 ms. Defaults to `1000` ms.
 * 
 * - endHold (number): The duration in milliseconds to hold the fully typed text before starting to delete it. Defaults to `2000` ms.
 * 
 * - startHold (number): The duration in milliseconds to wait after deleting a text before starting to type the next one. Defaults to `500` ms.
 * 
 * - characterHold (number): The duration in milliseconds to wait after typing each character before typing the next one. Defaults to `200` ms.
 * 
 * - deleteHold (number): The duration in milliseconds to wait after deleting each character before deleting the next one. Defaults to `100` ms.
 * 
 * - caretClass (string): Additional class(es) to add to the caret element for custom styling. Optional. If not provided, only the default `typewriter-wrap` class is applied.
 * 
 * **Error Handling:**
 * 
 * The constructor will throw errors in the following cases:
 * 
 * - If `addClass` is not provided.
 * - If `targetParent` is not provided or does not correspond to an existing HTML element.
 * - If `textArray` is not provided, is not an array, or is empty.
 * 
 * **Styling:**
 * 
 * The cursor blink animation is dynamically injected into the document's `<head>` with a unique keyframe name for each instance of the Typewriter class. The `caretFrequency` controls the speed of the blink.
 * 
 * **Customization:**
 * 
 * You can style the typewriter text and cursor by targeting the classes you provide via `addClass` and `caretClass`, as well as the default `typewriter-text` and `typewriter-wrap` classes. For example:
 * 
 * ```css
 * .custom-typewriter {
 *     color: #00ff00;
 *     font-family: 'Courier New', Courier, monospace;
 * }
 * 
 * .custom-caret {
 *     border-right-color: #00ff00; /* Override caret color */
     /* Additional caret styles if needed */
         //} 
// If `caretClass` is not provided, the caret will use the default `typewriter-wrap` styles defined in the JavaScript.