/**
 * @typedef {Object} ScrollBrightnessConfig
 * @property {number} [offset=0] - Prozentualer Offset (0-100), ab dem die Scroll-Animation gestartet wird.
 * @property {string} scrollTriggerClass - **(Erforderlich)** Klasse der Elemente, die als Scroll-Trigger dienen.
 * @property {string} [parentClass] - Klasse des übergeordneten Elements der zu animierenden Textelemente. Optional.
 * @property {string} zielKlasse - **(Erforderlich)** Klasse der Elemente, die während des Scrollens animiert werden sollen.
 * @property {number} [initialBrightness=0.15] - **(Optional)** Die anfängliche Opazität der Wörter (0 bis 1).
 * @property {number} [targetBrightness=1] - **(Optional)** Die Ziel-Opazität der Wörter am Ende der Scroll-Animation (0 bis 1).
 * @property {string} [transitionTime='0.3s'] - **(Optional)** Dauer der Opazitäts-Transition (z.B. '0.3s', '300ms').
 * @property {string} [easing='ease'] - **(Optional)** Timing-Funktion der Transition. Erlaubte Werte: 'ease', 'ease-in', 'ease-out', 'ease-in-out'.
 * @property {number} [keyframeLength=100] - **(Optional)** Länge des Scroll-Trigger Keyframes als Prozentsatz (100% = normale Länge, 200% = doppelte Länge).
 * @property {string} [backgroundClass] - **(Optional)** Klasse der Spans, die ein Hintergrundbild erhalten sollen.
 * @property {string} [background] - **(Optional)** Der `background-image` Wert, der den Spans mit `backgroundClass` zugewiesen wird.
 * @property {string} [linkAttribute] - **(Optional)** Ein Attribut, um Scroll-Trigger und Ziel-Elemente zu verknüpfen (z.B. 'data-group="1"').
 * @property {boolean} [fixedBackground=false] - **(Optional)** Wenn `true`, werden zusätzliche CSS-Eigenschaften `background-position: center center;`, `background-attachment: fixed;` und `background-size: cover;` angewendet.
 * @property {string} [fallbackMobileBackground] - **(Optional)** Der `background-image` Wert, der auf mobilen Geräten anstelle von `background` verwendet wird.
 *
 * @example
 * // Beispiel eines ScrollBrightnessConfig Objekts:
 * {
 *   offset: 20,
 *   scrollTriggerClass: '.scroll-trigger',
 *   parentClass: '.text-bright-scroll',
 *   zielKlasse: '.animated-text',
 *   initialBrightness: 0.15,
 *   targetBrightness: 1,
 *   transitionTime: '0.5s',
 *   easing: 'ease-in-out',
 *   keyframeLength: 100,
 *   backgroundClass: 'bg-text',
 *   background: 'linear-gradient(90deg, #ff7e5f, #feb47b)',
 *   fallbackMobileBackground: 'linear-gradient(90deg, #00c6ff, #0072ff)', // Fallback-Hintergrund für mobile Geräte
 *   linkAttribute: 'data-group', // Verwenden Sie ein gemeinsames Attribut, um Trigger und Ziel zu verknüpfen
 *   fixedBackground: true // Zusätzliche Hintergrund-Eigenschaften anwenden
 * }
 */
class ScrollBrightness {
    constructor(config) {
        const allowedEasings = ['ease', 'ease-in', 'ease-out', 'ease-in-out'];
        this.configurations = Array.isArray(config) ? config : [config];
        this.isScrollTicking = false;
        this.isResizeTicking = false;
        this.isDOMContentLoaded = false;

        // Neue Eigenschaft zur Erkennung von Mobilgeräten
        this.isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Map zur Gruppierung von Ziel-Elementen nach ihrem zugehörigen Scroll-Trigger
        this.groups = new Map();

        this.configurations.forEach((cfg, cfgIndex) => {
            if (cfg.easing && !allowedEasings.includes(cfg.easing)) {
                console.warn(
                    `Ungültiger easing-Wert '${cfg.easing}' in Konfiguration ${
                        cfgIndex + 1
                    }. Erlaubte Werte sind: ${allowedEasings.join(
                        ', '
                    )}. Standardwert 'ease' wird verwendet.`
                );
                cfg.easing = 'ease';
            }

            const configuration = {
                offset: cfg.offset !== undefined ? cfg.offset : 0,
                scrollTriggerClass: cfg.scrollTriggerClass,
                parentClass: cfg.parentClass || null,
                zielKlasse: cfg.zielKlasse,
                initialBrightness:
                    cfg.initialBrightness !== undefined
                        ? cfg.initialBrightness
                        : 0.15,
                targetBrightness:
                    cfg.targetBrightness !== undefined
                        ? cfg.targetBrightness
                        : 1,
                transitionTime:
                    cfg.transitionTime !== undefined
                        ? cfg.transitionTime
                        : '0.3s',
                easing:
                    cfg.easing !== undefined ? cfg.easing : 'ease',
                keyframeLength:
                    cfg.keyframeLength !== undefined
                        ? cfg.keyframeLength
                        : 100,
                backgroundClass: cfg.backgroundClass || null,
                background: cfg.background || null,
                fallbackMobileBackground: cfg.fallbackMobileBackground || null, // Neuer Parameter hinzugefügt
                linkAttribute: cfg.linkAttribute || null,
                fixedBackground:
                    cfg.fixedBackground !== undefined
                        ? cfg.fixedBackground
                        : false, // Neuer Parameter hinzugefügt
            };

            if (
                !configuration.scrollTriggerClass ||
                !configuration.zielKlasse
            ) {
                console.error(
                    `Konfiguration ${
                        cfgIndex + 1
                    }: 'scrollTriggerClass' und 'zielKlasse' sind erforderlich.`
                );
                return;
            }

            this.configurations[cfgIndex] = configuration;
        });

        // Bindings
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.domContentLoadedHandler = this.domContentLoadedHandler.bind(this);

        // Initialisierung
        if (
            document.readyState === 'complete' ||
            document.readyState === 'interactive'
        ) {
            this.domContentLoadedHandler();
        } else {
            document.addEventListener(
                'DOMContentLoaded',
                this.domContentLoadedHandler
            );
        }
    }

    domContentLoadedHandler() {
        if (this.isDOMContentLoaded) return;
        this.isDOMContentLoaded = true;
        this.initElements();

        // Optimierte Scroll- und Resize-Handler mit requestAnimationFrame
        window.addEventListener('scroll', this.onScroll.bind(this), {
            passive: true,
        });
        window.addEventListener('resize', this.onResize.bind(this));
        document.removeEventListener(
            'DOMContentLoaded',
            this.domContentLoadedHandler
        );
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
            const scrollTriggers = document.querySelectorAll(
                config.scrollTriggerClass
            );
            if (scrollTriggers.length === 0) {
                console.warn(
                    `Konfiguration ${
                        cfgIndex + 1
                    }: Keine Elemente mit der Klasse '${
                        config.scrollTriggerClass
                    }' gefunden.`
                );
                return;
            }

            const parents = document.querySelectorAll(config.parentClass || config.zielKlasse);
            if (parents.length === 0) {
                console.warn(
                    `Konfiguration ${
                        cfgIndex + 1
                    }: Keine Elemente mit der Klasse '${
                        config.parentClass || config.zielKlasse
                    }' gefunden.`
                );
                return;
            }

            // Verknüpfe Scroll-Trigger mit Parent-Elementen basierend auf dem linkAttribute oder Index
            scrollTriggers.forEach((trigger, index) => {
                let parent = null;

                if (config.linkAttribute) {
                    const triggerAttrValue = trigger.getAttribute(
                        config.linkAttribute
                    );

                    if (!triggerAttrValue) {
                        console.warn(
                            `Konfiguration ${
                                cfgIndex + 1
                            }, Trigger ${index + 1}: Das Attribut '${
                                config.linkAttribute
                            }' ist nicht definiert im Scroll-Trigger.`
                        );
                        return;
                    }

                    parent = Array.from(parents).find((parentElement) => {
                        return (
                            parentElement.getAttribute(config.linkAttribute) ===
                            triggerAttrValue
                        );
                    });

                    if (!parent) {
                        console.warn(
                            `Konfiguration ${
                                cfgIndex + 1
                            }, Trigger ${index + 1}: Kein Parent-Element mit dem Attribut '${
                                config.linkAttribute
                            }="${triggerAttrValue}"' gefunden.`
                        );
                        return;
                    }
                } else {
                    // Wenn kein linkAttribute definiert ist, verwenden wir den Index
                    parent = parents[index];
                    if (!parent) {
                        console.warn(
                            `Konfiguration ${
                                cfgIndex + 1
                            }, Trigger ${index + 1}: Kein entsprechendes Parent-Element gefunden.`
                        );
                        return;
                    }
                }

                const targets = parent.querySelectorAll(config.zielKlasse);
                if (targets.length === 0) {
                    console.warn(
                        `Konfiguration ${
                            cfgIndex + 1
                        }, Parent ${index + 1}: Keine Ziel-Elemente mit der Klasse '${
                            config.zielKlasse
                        }' gefunden.`
                    );
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

                targets.forEach((target) => {
                    this.prepareTarget(target, config);
                    const hasBackgroundClass = config.backgroundClass
                        ? target.classList.contains(config.backgroundClass)
                        : false;
                    // Wählen Sie das passende Hintergrundbild basierend auf dem Gerätetyp
                    const backgroundValue = hasBackgroundClass
                        ? (this.isMobile && config.fallbackMobileBackground ? config.fallbackMobileBackground : config.background)
                        : null;
                    const words = this.wrapWords(
                        target,
                        config,
                        hasBackgroundClass,
                        backgroundValue
                    );

                    groupData.totalWordsInGroup += words.length;

                    groupData.targets.push({
                        element: target,
                        words: words,
                        hasBackgroundClass: hasBackgroundClass,
                        backgroundValue: backgroundValue,
                        wordStartIndex:
                            groupData.totalWordsInGroup - words.length,
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

        const wordsArray = text.split(' '); // Text in Wörter aufteilen

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

                // Zusätzliche CSS-Eigenschaften basierend auf fixedBackground
                if (config.fixedBackground) {
                    span.style.backgroundPosition = 'center center';
                    span.style.backgroundAttachment = 'fixed';
                    span.style.backgroundSize = 'cover';
                }
            }

            element.appendChild(span);
            words.push(span);

            // Füge ein Leerzeichen nach jedem Wort hinzu, außer nach dem letzten
            if (index < wordsArray.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });

        return words;
    }

    handleScroll() {
        const windowHeight =
            window.innerHeight || document.documentElement.clientHeight;

        // Iteriere über jede Gruppe
        this.groups.forEach((groupData) => {
            const { trigger, parent, config, totalWordsInGroup } = groupData;

            // Holen des triggerRect
            const triggerRect = trigger.getBoundingClientRect();

            const triggerHeight = triggerRect.height;
            const offsetPx = (config.offset / 100) * triggerHeight;

            // Berechnung des Fortschritts basierend auf der Position des Triggers und des Viewports
            // 0% wenn viewportBottom == triggerTop - offset
            // 100% wenn viewportBottom == triggerBottom - offset

            const viewportBottom = windowHeight;
            const triggerTop = triggerRect.top;
            const triggerBottom = triggerRect.bottom;

            // Berechne den Fortschritt
            let progress = ((viewportBottom - triggerTop - offsetPx) / triggerHeight) * 100;

            // Clamp den Fortschritt zwischen 0 und 100
            const clampedProgress = Math.max(0, Math.min(100, progress));

            // Überprüfen, ob sich der Fortschritt geändert hat
            if (clampedProgress === groupData.lastClampedProgress) {
                // Keine Änderung, überspringe Aktualisierungen
                return;
            }
            groupData.lastClampedProgress = clampedProgress;

            // Gesamten Fortschritt in Bezug auf alle Wörter berechnen
            const totalWordsToLight = Math.floor(
                (clampedProgress / 100) * totalWordsInGroup
            );

            // Aktualisiere alle Ziele unter dieser Gruppe
            groupData.targets.forEach((item) => {
                const {
                    words,
                    hasBackgroundClass,
                    backgroundValue,
                    wordStartIndex,
                } = item;

                const wordsInThisTarget = words.length;

                const wordsToLightInThisTarget = Math.max(
                    0,
                    Math.min(
                        wordsInThisTarget,
                        totalWordsToLight - wordStartIndex
                    )
                );

                // Aktualisiere nur bei Änderungen
                if (wordsToLightInThisTarget !== item.lastWordsToLight) {
                    item.lastWordsToLight = wordsToLightInThisTarget;

                    words.forEach((span, wordIndex) => {
                        if (wordIndex < wordsToLightInThisTarget) {
                            span.style.opacity = config.targetBrightness;
                            // Hintergrund-Eigenschaften sind bereits gesetzt
                        } else {
                            span.style.opacity = config.initialBrightness;
                            // Hintergrund-Eigenschaften bleiben unverändert
                        }
                    });
                }
            });
        });
    }

    handleResize() {
        // Bei einer Größenänderung können wir die Fortschrittswerte zurücksetzen
        this.groups.forEach((groupData) => {
            groupData.lastClampedProgress = -1;
        });
        this.handleScroll();
    }
}

window.ScrollBrightness = ScrollBrightness;