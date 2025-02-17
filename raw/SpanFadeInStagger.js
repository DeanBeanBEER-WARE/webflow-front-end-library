/**
 * SpanFadeInStagger Class
 *
 * Applies a staggered fade-in animation to text elements by wrapping their text in spans.
 *
 * Options:
 * - textIDs (Array<string>): IDs of the elements whose text will be animated.
 * - easing (string): CSS easing function (default: 'ease').
 * - transition (string): Duration of the transition (default: '200ms').
 * - threshold (number): Intersection threshold to trigger the animation (default: 0.5).
 * - staggerDelay (number): Delay in ms between animations of consecutive spans (default: 100).
 * - repeat (boolean): If true, animation resets when the element leaves the viewport (default: false).
 * - tokenSizeWord (boolean): If true, wraps individual words; if false, wraps lines (default: false).
 * - responsive (boolean): If true, re-initializes on window resize (default: false).
 *
 * Example instantiation (asynchron sicher):
 * window.addEventListener('DOMContentLoaded', () => {
 *   new SpanFadeInStagger({
 *     textIDs: ['headline1', 'introText'],
 *     easing: 'ease-in-out',
 *     transition: '300ms',
 *     threshold: 0.6,
 *     staggerDelay: 120,
 *     repeat: true,
 *     tokenSizeWord: true,
 *     responsive: true
 *   });
 * });
 *
 * @version 1.0.0
 * @license MIT
 */
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.init();
        if (this.responsive) {
          window.addEventListener('resize', this.debounce(() => this.init(), 300));
        }
      });
    } else {
      this.init();
      if (this.responsive) {
        window.addEventListener('resize', this.debounce(() => this.init(), 300));
      }
    }
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
  
      if (spans.length === 0) {
        console.warn(`No ${this.tokenSizeWord ? 'word' : 'line'} spans found within element with ID "${textID}".`);
      } else {
        spans.forEach(span => {
          span.style.display = this.tokenSizeWord ? 'inline-block' : 'block';
          if (this.tokenSizeWord) {
            span.style.whiteSpace = 'pre-wrap';
          }
          span.style.opacity = '0';
          span.style.transform = 'translateY(20px)';
          span.style.transition = `opacity ${this.transition} ${this.easing}, transform ${this.transition} ${this.easing}`;
          span.style.willChange = 'opacity, transform';
        });
      }
  
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
    const spanElements = [];
    textNodes.forEach(textNode => {
      const parts = textNode.textContent.split(/(\s+)/);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.trim() !== '') {
          const span = document.createElement('span');
          span.textContent = part + ((i + 1 < parts.length && parts[i + 1].trim() === '') ? parts[i + 1] : '');
          span.classList.add('word-span');
          element.insertBefore(span, textNode);
          spanElements.push(span);
        }
      }
      element.removeChild(textNode);
    });
  
    const lines = [];
    spanElements.forEach(span => {
      range.selectNode(span);
      const rect = range.getBoundingClientRect();
      const top = rect.top;
      if (lines.length === 0 || Math.abs(top - lines[lines.length - 1].top) > 5) {
        lines.push({ top: top, spans: [span] });
      } else {
        lines[lines.length - 1].spans.push(span);
      }
    });
  
    lines.forEach(line => {
      const lineSpan = document.createElement('span');
      lineSpan.classList.add('line-span');
      line.spans[0].parentNode.insertBefore(lineSpan, line.spans[0]);
      line.spans.forEach(span => {
        lineSpan.appendChild(span);
      });
    });
  }
  
  wrapWordsInSpans(element) {
    const textNodes = this.getTextNodes(element);
    const wordSpans = [];
    textNodes.forEach(textNode => {
      const parts = textNode.textContent.split(/(\s+)/);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.trim() !== '') {
          const span = document.createElement('span');
          span.textContent = part + ((i + 1 < parts.length && parts[i + 1].trim() === '') ? parts[i + 1] : '');
          span.classList.add('word-span');
          element.insertBefore(span, textNode);
          wordSpans.push(span);
        }
      }
      element.removeChild(textNode);
    });
  }
  
  getTextNodes(element) {
    let nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim() !== '') {
        nodes.push(node);
      }
    }
    return nodes;
  }
}
window.SpanFadeInStagger = SpanFadeInStagger;
