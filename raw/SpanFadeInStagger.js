class SpanFadeInStagger {
    constructor(config) {
        this.textIDs = config.textIDs || [];
        this.easing = config.easing || 'ease';
        this.transition = config.transition || '200ms';
        this.threshold = config.threshold || 0.5;
        this.staggerDelay = config.staggerDelay || 100;
        this.repeat = config.repeat || false;
        this.tokenSizeWord = config.tokenSizeWord || false;
        this.responsive = config.responsive || false;
        this.observers = new Map();

        document.addEventListener('DOMContentLoaded', () => {
            this.init();
            if (this.responsive) {
                window.addEventListener('resize', this.debounce(() => this.init(), 300));
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this), wait);
        };
    }

    init() {
        this.textIDs.forEach(textID => {
            const textElement = document.getElementById(textID);
            if (!textElement) {
                console.error(`Element with ID "${textID}" not found.`);
                return;
            }

            if (this.observers.has(textID)) {
                this.observers.get(textID).disconnect();
                this.observers.delete(textID);
            }

            if (!this.repeat && textElement.getAttribute('data-animated') === 'true') {
                return;
            }

            this.unwrapSpans(textElement);
            this.tokenSizeWord ? this.wrapWordsInSpans(textElement) : this.wrapLinesInSpans(textElement);
            textElement.style.overflow = 'hidden';
            const spans = this.tokenSizeWord
                ? Array.from(textElement.querySelectorAll('span.word-span'))
                : Array.from(textElement.querySelectorAll('span.line-span'));

            spans.length === 0
                ? console.warn(`No ${this.tokenSizeWord ? 'word' : 'line'} spans found within element with ID "${textID}".`)
                : spans.forEach(span => {
                    span.style.display = this.tokenSizeWord ? 'inline-block' : 'block';
                    if (this.tokenSizeWord) {
                        span.style.whiteSpace = 'pre-wrap';
                    }
                    span.style.opacity = '0';
                    span.style.transform = 'translateY(20px)';
                    span.style.transition = `opacity ${this.transition} ${this.easing}, transform ${this.transition} ${this.easing}`;
                    span.style.willChange = 'opacity, transform';
                });

            const observerOptions = { threshold: this.threshold };

            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateSpans(spans);
                        if (!this.repeat) {
                            textElement.setAttribute('data-animated', 'true');
                            observerInstance.unobserve(entry.target);
                        }
                    } else if (this.repeat) {
                        this.resetSpans(spans);
                    }
                });
            }, observerOptions);

            observer.observe(textElement);
            this.observers.set(textID, observer);
        });
    }

    animateSpans(spans) {
        spans.forEach((span, index) => {
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, index * this.staggerDelay);
        });
    }

    resetSpans(spans) {
        spans.forEach(span => {
            span.style.opacity = '0';
            span.style.transform = 'translateY(20px)';
        });
    }

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

    wrapWordsInSpans(element) {
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
    }

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

window.SpanFadeInStagger = SpanFadeInStagger;