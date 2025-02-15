/**
 * Typewriter Class
 *
 * Creates a typewriter effect by typing and deleting texts on a target element.
 *
 * Options:
 * - hTag (string): The heading tag to use (e.g., 'h1', 'h2'). Defaults to 'h1' if invalid.
 * - addClass (string): Additional class(es) to apply to the text element. (Required)
 * - textArray (Array<string>): Array of texts to display. (Required)
 * - targetParent (string): ID of the parent element to which the typewriter will be appended. (Required)
 * - randomText (boolean): If true, texts are selected randomly. Default: false.
 * - caretFrequency (number): Blink frequency of the caret in milliseconds. Default: 1000.
 * - endHold (number): Time in milliseconds to hold the full text before deleting. Default: 2000.
 * - startHold (number): Time in milliseconds to wait after deleting before typing the next text. Default: 500.
 * - characterHold (number): Time in milliseconds between typing each character. Default: 200.
 * - deleteHold (number): Time in milliseconds between deleting each character. Default: 100.
 * - caretClass (string): Additional class(es) for the caret element. (Optional)
 *
 * Example:
 *
 * new Typewriter({
 *   hTag: 'h2',
 *   addClass: 'typewriter-style',
 *   textArray: ["Hello World!", "Welcome to the demo."],
 *   targetParent: 'typeparent',
 *   randomText: true,
 *   caretFrequency: 500,
 *   endHold: 3000,
 *   startHold: 1000,
 *   characterHold: 150,
 *   deleteHold: 100,
 *   caretClass: 'caret'
 * });
 *
 * @version 1.0.0
 * @license MIT
 */
class Typewriter {
    constructor(options) {
      Typewriter.instanceCounter = (Typewriter.instanceCounter || 0) + 1;
      this.instanceId = Typewriter.instanceCounter;
  
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
        caretClass
      } = options;
  
      this.options = { hTag, addClass, textArray, targetParent, randomText, caretFrequency, endHold, startHold, characterHold, deleteHold, caretClass };
  
      this.loopNum = 0;
      this.isDeleting = false;
      this.txt = '';
      this.currentText = '';
      this.previousTextIndex = -1;
  
      this._init = this._init.bind(this);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this._init);
      } else {
        this._init();
      }
    }
  
    _init() {
      const { hTag, addClass, textArray, targetParent, randomText, caretFrequency, endHold, startHold, characterHold, deleteHold, caretClass } = this.options;
      if (!addClass) {
        throw new Error("Typewriter Error: 'addClass' is required.");
      }
      if (!targetParent) {
        throw new Error("Typewriter Error: 'targetParent' is required.");
      }
      if (!textArray || !Array.isArray(textArray) || textArray.length === 0) {
        throw new Error("Typewriter Error: 'textArray' must be a non-empty array.");
      }
      this.hTag = /^h[1-6]$/.test(hTag) ? hTag : 'h1';
      this.addClass = addClass;
      this.textArray = textArray.slice();
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
      this.caretClass = caretClass;
  
      this._createElements();
      this.tick();
    }
  
    _createElements() {
      this.headingElement = document.createElement(this.hTag);
      this.headingElement.classList.add(this.addClass, 'typewriter-text');
  
      this.wrapSpan = document.createElement('span');
      this.wrapSpan.classList.add('typewriter-wrap');
      if (this.caretClass) {
        this.wrapSpan.classList.add(this.caretClass);
      }
  
      this.headingElement.appendChild(this.wrapSpan);
      this.targetParent.appendChild(this.headingElement);
  
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
  
    _getNextText() {
      if (this.randomText) {
        if (this.textArray.length === 1) return this.textArray[0];
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * this.textArray.length);
        } while (nextIndex === this.previousTextIndex);
        this.previousTextIndex = nextIndex;
        return this.textArray[nextIndex];
      } else {
        const index = this.loopNum % this.textArray.length;
        return this.textArray[index];
      }
    }
  
    tick() {
      if (!this.currentText) {
        this.currentText = this._getNextText();
      }
      if (this.isDeleting) {
        this.txt = this.currentText.substring(0, this.txt.length - 1);
      } else {
        this.txt = this.currentText.substring(0, this.txt.length + 1);
      }
      this.wrapSpan.textContent = this.txt;
  
      let delta = this.isDeleting ? this.deleteHold : this.characterHold;
      if (!this.isDeleting && this.txt === this.currentText) {
        delta = this.endHold;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        this.currentText = '';
        delta = this.startHold;
      }
  
      setTimeout(() => this.tick(), delta);
    }
  }
  
  window.Typewriter = Typewriter;
  