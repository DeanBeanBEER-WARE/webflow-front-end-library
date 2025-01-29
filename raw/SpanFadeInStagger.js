/**
 * SpanFadeInStagger Class
 * 
 * A utility class for staggered fade-in animations of text spans. This class monitors the visibility
 * of specified text elements and triggers a staggered fade-in effect when they enter the viewport.
 * It supports responsive behavior by re-initializing upon window resize and ensures optimal performance
 * through debouncing and the use of MutationObservers.
 * 
 * @version 1.3.1
 * @author 
 * @license MIT
 * 
 * ## Usage
 * 
 * Include this script via a CDN or a local file, then instantiate the SpanFadeInStagger class
 * with the desired configuration options.
 * 
 * ```javascript
 * new SpanFadeInStagger({
 *     textIDs: ['textMain', 'textSecondary'], // IDs of the text elements to animate
 *     easing: 'ease-out',                      // Easing function for the animation
 *     transition: '300ms',                     // Duration of the transition
 *     threshold: 0.5,                          // Visibility threshold for triggering the animation
 *     staggerDelay: 150,                       // Delay between each span's animation in milliseconds
 *     responsive: true                         // Enables re-initialization on window resize
 * });
 * ```
 * 
 * ## Configuration Options
 * 
 * | Option        | Type           | Description                                                                                                   |
 * |---------------|----------------|---------------------------------------------------------------------------------------------------------------|
 * | textIDs       | Array<string>  | Array of IDs of the text elements to be animated.                                                            |
 * | easing        | string         | Easing function for the transition. Possible values: 'ease', 'ease-in', 'ease-out', 'linear'.                |
 * | transition    | string         | Duration of the transition (e.g., '200ms', '0.3s').                                                          |
 * | threshold     | number         | Visibility threshold (between 0 and 1) for the IntersectionObserver to trigger the animation.                 |
 * | staggerDelay  | number         | Delay between the animations of individual spans in milliseconds.                                             |
 * | responsive    | boolean        | If `true`, re-initializes the animations upon window resize to handle responsive layouts.                     |
 * 
 * ## Example
 * 
 * ```javascript
 * new SpanFadeInStagger({
 *     textIDs: ['textMain', 'textSecondary'],
 *     easing: 'ease-out',
 *     transition: '300ms',
 *     threshold: 0.5,
 *     staggerDelay: 150,
 *     responsive: true
 * });
 * ```
 */

class SpanFadeInStagger {
    /**
     * Constructor for SpanFadeInStagger
     * @param {Object} config - Configuration object
     * @param {Array<string>} config.textIDs - IDs of the text elements to animate
     * @param {string} [config.easing='ease'] - Easing function for the transition
     * @param {string} [config.transition='200ms'] - Duration of the transition
     * @param {number} [config.threshold=0.5] - Visibility threshold for the IntersectionObserver
     * @param {number} [config.staggerDelay=100] - Delay between each span's animation in milliseconds
     * @param {boolean} [config.responsive=false] - Enables re-initialization on window resize
     */
    constructor(config) {
        this.textIDs = config.textIDs || [];
        this.easing = config.easing || 'ease';
        this.transition = config.transition || '200ms';
        this.threshold = config.threshold || 0.5;
        this.staggerDelay = config.staggerDelay || 100;
        this.responsive = config.responsive || false;
        this.observers = new Map();

        document.addEventListener('DOMContentLoaded', () => {
            this.init();
            if (this.responsive) {
                window.addEventListener('resize', this.debounce(() => this.init(), 300));
            }
        });
    }

    /**
     * Debounce function to delay the execution of a function
     * @param {Function} func - The function to debounce
     * @param {number} wait - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this), wait);
        };
    }

    /**
     * Initializes the SpanFadeInStagger instance by setting up observers and preparing elements
     */
    init() {
        this.textIDs.forEach(textID => {
            const textElement = document.getElementById(textID);
            if (!textElement) {
                console.error(`Element with ID "${textID}" not found.`);
                return;
            }

            if (textElement.getAttribute('data-animated') === 'true') {
                return;
            }

            if (this.observers.has(textID)) {
                const oldObserver = this.observers.get(textID);
                oldObserver.disconnect();
                this.observers.delete(textID);
            }

            this.unwrapSpans(textElement);
            this.wrapLinesInSpans(textElement);
            textElement.style.overflow = 'hidden';
            const spans = Array.from(textElement.querySelectorAll('span.line-span'));

            if (spans.length === 0) {
                console.warn(`No line spans found within the element with ID "${textID}".`);
                return;
            }

            spans.forEach(span => {
                span.style.display = 'block';
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                span.style.transition = `opacity ${this.transition} ${this.easing}, transform ${this.transition} ${this.easing}`;
                span.style.willChange = 'opacity, transform';
            });

            const observerOptions = {
                threshold: this.threshold
            };

            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateSpans(spans);
                        textElement.setAttribute('data-animated', 'true');
                        observerInstance.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            observer.observe(textElement);
            this.observers.set(textID, observer);
        });
    }

    /**
     * Animates the individual spans with a staggered delay
     * @param {Array<HTMLElement>} spans - Array of span elements to animate
     */
    animateSpans(spans) {
        spans.forEach((span, index) => {
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, index * this.staggerDelay);
        });
    }

    /**
     * Wraps words and lines in spans for individual animation
     * @param {HTMLElement} element - The text element to process
     */
    wrapLinesInSpans(element) {
        const range = document.createRange();
        const textNodes = this.getTextNodes(element);
        const wordSpans = [];

        textNodes.forEach(node => {
            const words = node.textContent.split(/(\s+)/);
            for(let i = 0; i < words.length; i++) {
                const word = words[i];
                if(word.trim() !== '') {
                    const space = (i + 1 < words.length && words[i + 1].trim() === '') ? words[i + 1] : '';
                    const span = document.createElement('span');
                    span.textContent = word + space;
                    span.classList.add('word-span');
                    element.insertBefore(span, node);
                    wordSpans.push(span);
                }
            }
            element.removeChild(node);
        });

        const lines = [];
        wordSpans.forEach(span => {
            range.selectNode(span);
            const rect = range.getBoundingClientRect();
            const top = rect.top;

            if(lines.length === 0 || Math.abs(top - lines[lines.length -1].top) > 5) {
                lines.push({ top: top, spans: [span] });
            } else {
                lines[lines.length -1].spans.push(span);
            }
        });

        lines.forEach(line => {
            const lineSpan = document.createElement('span');
            lineSpan.classList.add('line-span');
            line.spans[0].parentNode.insertBefore(lineSpan, line.spans[0]);
            line.spans.forEach(wordSpan => {
                lineSpan.appendChild(wordSpan);
            });
        });
    }

    /**
     * Removes existing span wrappers from the text element
     * @param {HTMLElement} element - The text element to process
     */
    unwrapSpans(element) {
        const existingLineSpans = Array.from(element.querySelectorAll('span.line-span'));
        existingLineSpans.forEach(lineSpan => {
            const parent = lineSpan.parentNode;
            while (lineSpan.firstChild) {
                parent.insertBefore(lineSpan.firstChild, lineSpan);
            }
            parent.removeChild(lineSpan);
        });

        const existingWordSpans = Array.from(element.querySelectorAll('span.word-span'));
        existingWordSpans.forEach(wordSpan => {
            const parent = wordSpan.parentNode;
            const textNode = document.createTextNode(wordSpan.textContent);
            parent.insertBefore(textNode, wordSpan);
            parent.removeChild(wordSpan);
        });
    }

    /**
     * Retrieves all text nodes within an element
     * @param {HTMLElement} element - The element to search within
     * @returns {Array<Text>} - Array of text nodes
     */
    getTextNodes(element) {
        let textNodes = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            if (node.textContent.trim() !== '') {
                textNodes.push(node);
            }
        }
        return textNodes;
    }
}

// Makes the SpanFadeInStagger class globally available
window.SpanFadeInStagger = SpanFadeInStagger;