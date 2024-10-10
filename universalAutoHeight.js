/**
 * @typedef {Object} ToggleHeightConfig
 * @property {string} [parentSelector] - Selector für die übergeordneten Elemente, die Trigger und Targets enthalten (z.B. '.faq-container').
 * Falls nicht angegeben, wird das gesamte Dokument verwendet.
 *
 * @property {string} triggerSelector - **(Erforderlich)** Selector für die Elemente, die als Trigger fungieren, um die Höhe umzuschalten (z.B. '.faq-p').
 * @property {string} targetSelector - **(Erforderlich)** Selector für die Elemente, deren Höhe umgeschaltet wird (z.B. '.faq-body').
 * @property {string} [rotateSelector] - Selector für die Elemente, die sich drehen, wenn der Trigger geklickt wird (z.B. '.rotate-arrow'). Optional.
 * @property {boolean} [isOpen=false] - Bestimmt, ob die Target-Elemente standardmäßig geöffnet sein sollen.
 * @property {number} [duration=300] - Dauer der Höhen-Transition in Millisekunden.
 * @property {boolean} [closeOthers=true] - Wenn `true`, wird das Öffnen eines Targets andere innerhalb derselben Konfiguration schließen.
 * @property {string} [easingMode='ease'] - CSS-Easing-Funktion für die Transitions (z.B. 'ease', 'ease-in', 'ease-out', 'ease-in-out').
 * @property {number} [fontSizeMultiplier=1] - **(Optional)** Multiplikator für die Root-`fontSize`, der zur Berechnung der kollabierten Höhe verwendet wird.
 * @property {number} [expandedRotation=90] - **(Optional)** Der Rotationswinkel in Grad, wenn das Element erweitert wird.
 */

/**
 * Klasse verantwortlich für das Umschalten der Höhe von Elementen mit sanften Übergängen.
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
            expandedRotation: config.expandedRotation !== undefined ? config.expandedRotation : 90 // Neuer Parameter
        }));

        this.domContentLoadedHandler = this.domContentLoadedHandler.bind(this);
        document.addEventListener('DOMContentLoaded', this.domContentLoadedHandler);
    }

    /**
     * Holt die Root-FontSize des Dokuments in Pixeln.
     * @returns {number} Die Root-FontSize als Zahl (z.B. 16).
     * @private
     */
    getRootFontSize() {
        const fontSizeStr = window.getComputedStyle(document.documentElement).fontSize;
        return parseFloat(fontSizeStr);
    }

    /**
     * Berechnet die kollabierte Höhe basierend auf der Root-FontSize und dem Multiplikator.
     * @param {ToggleHeightConfig} config - Die aktuelle Konfiguration.
     * @returns {string} Die kollabierte Höhe als Zeichenkette mit Einheit (z.B. '16px').
     * @private
     */
    getCollapsedHeight(config) {
        const rootFontSize = this.getRootFontSize();
        const collapsedHeight = rootFontSize * config.fontSizeMultiplier;
        return `${collapsedHeight}px`;
    }

    /**
     * Handler für das DOMContentLoaded-Ereignis. Initialisiert alle Konfigurationen und richtet den Fenster-Resize-Listener ein.
     * @private
     */
    domContentLoadedHandler() {
        this.configs.forEach(config => this.initConfig(config));
        document.removeEventListener('DOMContentLoaded', this.domContentLoadedHandler);

        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);
    }

    /**
     * Initialisiert eine einzelne Konfiguration, indem DOM-Elemente ausgewählt und Event-Listener eingerichtet werden.
     * @param {ToggleHeightConfig} config - Das Konfigurationsobjekt, das initialisiert werden soll.
     * @private
     */
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
            expandedRotation = 90 // Neuer Parameter
        } = config;

        if (!triggerSelector || !targetSelector) {
            console.error('triggerSelector und targetSelector sind in ToggleHeightConfig erforderlich.');
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
        config.expandedRotation = expandedRotation; // Neuer Parameter setzen

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

    /**
     * Initialisiert die Stile des Target-Elements für Höhen-Transitions.
     * @param {HTMLElement} element - Das Element, dessen Höhe umgeschaltet wird.
     * @param {ToggleHeightConfig} config - Die aktuelle Konfiguration.
     * @private
     */
    initElement(element, config) {
        element.style.overflow = 'hidden';
        element.style.transition = `height ${config.duration}ms ${config.easingMode}`;
        if (config.isOpen) {
            element.style.height = `${element.scrollHeight}px`;
        } else {
            element.style.height = this.getCollapsedHeight(config);
        }
    }

    /**
     * Handhabt die Umschaltaktion, wenn ein Trigger aktiviert wird.
     * @param {number} index - Der Index des aktivierten Triggers.
     * @param {HTMLElement} target - Das Ziel-Element, das umgeschaltet wird.
     * @param {HTMLElement|null} rotateElement - Das Element, das rotiert werden soll, falls vorhanden.
     * @param {ToggleHeightConfig} config - Die aktuelle Konfiguration.
     * @private
     */
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

    /**
     * Erweitert das Ziel-Element auf seine volle Höhe.
     * @param {HTMLElement} target - Das Element, das erweitert wird.
     * @param {HTMLElement|null} rotateElement - Das Element, das rotiert werden soll, falls vorhanden.
     * @param {ToggleHeightConfig} config - Die aktuelle Konfiguration.
     * @private
     */
    expand(target, rotateElement, config) {
        target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
        target.style.height = `${target.scrollHeight}px`;
        if (rotateElement) {
            this.rotate(rotateElement, config.expandedRotation, config.duration, config.easingMode);
        }
    }

    /**
     * Kollabiert das Ziel-Element auf die berechnete Höhe basierend auf der Root-FontSize und dem Multiplikator.
     * @param {HTMLElement} target - Das Element, das kollabiert wird.
     * @param {HTMLElement|null} rotateElement - Das Element, das rotiert werden soll, falls vorhanden.
     * @param {ToggleHeightConfig} config - Die aktuelle Konfiguration.
     * @private
     */
    collapse(target, rotateElement, config) {
        target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
        target.style.height = this.getCollapsedHeight(config);
        if (rotateElement) {
            this.rotate(rotateElement, 0, config.duration, config.easingMode);
        }
    }

    /**
     * Rotiert ein Element auf einen angegebenen Grad.
     * @param {HTMLElement} element - Das Element, das rotiert werden soll.
     * @param {number} degrees - Der Grad, auf den das Element rotiert werden soll.
     * @param {number} duration - Dauer der Rotations-Transition in Millisekunden.
     * @param {string} easingMode - CSS-Easing-Funktion für die Rotations-Transition.
     * @private
     */
    rotate(element, degrees, duration, easingMode) {
        element.style.transition = `transform ${duration}ms ${easingMode}`;
        element.style.transform = `rotate(${degrees}deg)`;
    }

    /**
     * Handhabt Fenster-Resize-Ereignisse, um die Höhe von offenen und kollabierten Elementen anzupassen.
     * @private
     */
    onWindowResize() {
        this.configs.forEach(config => {
            const newCollapsedHeight = this.getCollapsedHeight(config);
            config.targets.forEach((target, index) => {
                const rotateElement = config.rotateElements[index] || null;
                const isOpen = parseFloat(target.style.height) > parseFloat(newCollapsedHeight);

                if (isOpen) {
                    // Element ist geöffnet, aktualisiere seine Höhe basierend auf dem neuen scrollHeight
                    const originalTransition = target.style.transition;
                    target.style.transition = 'none';
                    target.style.height = `${target.scrollHeight}px`;
                    // Trigger Reflow
                    target.offsetHeight;
                    target.style.transition = originalTransition;
                } else {
                    // Element ist kollabiert, aktualisiere seine Höhe basierend auf dem neuen multiplikator
                    target.style.transition = 'height 0ms';
                    target.style.height = newCollapsedHeight;
                    // Trigger Reflow
                    target.offsetHeight;
                    // Wiederherstellung der Transition
                    target.style.transition = `height ${config.duration}ms ${config.easingMode}`;
                }
            });
        });
    }
}

window.ToggleHeight = ToggleHeight;