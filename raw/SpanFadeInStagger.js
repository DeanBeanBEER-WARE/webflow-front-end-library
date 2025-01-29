class SpanFadeInStagger {
    /**
     * Constructs a new SpanFadeInStagger instance.
     *
     * @param {Object} config - Configuration object for the SpanFadeInStagger.
     * @param {Array<string>} [config.textIDs=[]] - The IDs of the text elements to animate.
     * @param {string} [config.easing='ease'] - The CSS easing function to use.
     * @param {string} [config.transition='200ms'] - The default transition time.
     * @param {number} [config.threshold=0.5] - Intersection threshold to trigger the animation.
     * @param {number} [config.staggerDelay=100] - Delay in milliseconds for staggering the animation.
     * @param {boolean} [config.repeat=false] - Determines whether the animation should repeat on exit.
     * @param {boolean} [config.responsive=false] - Determines whether the code should re-initialize on window resize.
     */
    constructor(config) {
        this.textIDs = config.textIDs || [];
        this.easing = config.easing || 'ease';
        this.transition = config.transition || '200ms';
        this.threshold = config.threshold || 0.5;
        this.staggerDelay = config.staggerDelay || 100;
        this.repeat = config.repeat || false;
        this.responsive = config.responsive || false;
        this.observers = new Map();

        // When the DOM is ready, initialize the class behavior
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
            if (this.responsive) {
                window.addEventListener('resize', this.debounce(() => this.init(), 300));
            }
        });
    }

    /**
     * Creates a debounced version of a given function.
     *
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The time (in milliseconds) to wait before invoking the function.
     * @returns {Function} - A debounced function.
     * @private
     */
    debounce(func, wait) {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this), wait);
        };
    }

    /**
     * Initializes the animation setup by creating IntersectionObservers
     * for each text element and setting up the spans for the animation.
     *
     * @private
     */
    init() {
        this.textIDs.forEach(textID => {
            const textElement = document.getElementById(textID);
            if (!textElement) return;

            // Remove any previously wrapped spans
            this.unwrapSpans(textElement);
            // Wrap lines in spans for more fine-grained control
            this.wrapLinesInSpans(textElement);

            // Configure the IntersectionObserver
            const observerOptions = {
                threshold: this.threshold
            };

            const spans = Array.from(textElement.querySelectorAll('.word-span, .line-span'));

            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Animate if element is in view
                        this.animateSpans(spans);
                        if (!this.repeat) {
                            textElement.setAttribute('data-animated', 'true');
                            observerInstance.unobserve(entry.target);
                        }
                    } else if (this.repeat) {
                        // Reset if element is out of view and repeat is true
                        this.resetSpans(spans);
                    }
                });
            }, observerOptions);

            observer.observe(textElement);
            this.observers.set(textID, observer);
        });
    }

    /**
     * Animates each span of text with a staggered delay.
     *
     * @param {HTMLElement[]} spans - An array of spans to animate.
     * @private
     */
    animateSpans(spans) {
        spans.forEach((span, index) => {
            span.style.transition = `opacity ${this.transition} ${this.easing}, transform ${this.transition} ${this.easing}`;
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, index * this.staggerDelay);
        });
    }

    /**
     * Resets the spans to their initial hidden state.
     *
     * @param {HTMLElement[]} spans - An array of spans to reset.
     * @private
     */
    resetSpans(spans) {
        spans.forEach(span => {
            span.style.opacity = '0';
            span.style.transform = 'translateY(10px)';
        });
    }

    /**
     * Wraps each line of text in span elements for more precise control of animation.
     * First splits text nodes by words, then groups them into lines.
     *
     * @param {HTMLElement} element - The text element to split into spans.
     * @private
     */
    wrapLinesInSpans(element) {
        const range = document.createRange();
        const textNodes = this.getTextNodes(element);
        const wordSpans = [];

        // Transform each word into a span
        textNodes.forEach(node => {
            const words = node.textContent.split(/(\s+)/);
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                if (word.trim() !== '') {
                    // Check for trailing space
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

        // Accumulate words into lines based on their bounding rectangles
        const lines = [];
        wordSpans.forEach(span => {
            range.selectNode(span);
            const rect = range.getBoundingClientRect();
            const top = rect.top;

            if (lines.length === 0 || Math.abs(top - lines[lines.length - 1].top) > 5) {
                lines.push({ top: top, spans: [span] });
            } else {
                lines[lines.length - 1].spans.push(span);
            }
        });

        // Optionally, you could place line-specific wrapping if needed
        lines.forEach(line => {
            // This is where you might insert a .line-span if you want a container for each line
            // For now, leaving it as is
        });
    }

    /**
     * Unwraps any spans created for lines and words, returning the text element to its original state.
     *
     * @param {HTMLElement} element - The text element to unwrap.
     * @private
     */
    unwrapSpans(element) {
        // Remove existing line spans
        const existingLineSpans = Array.from(element.querySelectorAll('span.line-span'));
        existingLineSpans.forEach(lineSpan => {
            while (lineSpan.firstChild) {
                lineSpan.parentNode.insertBefore(lineSpan.firstChild, lineSpan);
            }
            lineSpan.parentNode.removeChild(lineSpan);
        });

        // Remove existing word spans
        const existingWordSpans = Array.from(element.querySelectorAll('span.word-span'));
        existingWordSpans.forEach(wordSpan => {
            const parent = wordSpan.parentNode;
            while (wordSpan.firstChild) {
                parent.insertBefore(wordSpan.firstChild, wordSpan);
            }
            parent.removeChild(wordSpan);
        });
    }

    /**
     * Retrieves all text nodes within a given element that contain non-whitespace text.
     *
     * @param {HTMLElement} element - The element from which to retrieve text nodes.
     * @returns {Node[]} - An array of text nodes.
     * @private
     */
    getTextNodes(element) {
        const textNodes = [];
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

window.SpanFadeInStagger = SpanFadeInStagger;