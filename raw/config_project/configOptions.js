/**
 * Default configuration options for ComboClassConfigurator.
 * @type {Object}
 */
(function() {
    window.defaultConfig = {
        eventName: "click",
        transitionTime: "0s",
        removeTransitionTime: null,
        easingMode: "ease",
        entryThreshold: 0,
        exitThreshold: null,
        parentElement: "",
        triggerElement: "",
        once: false,
        debounce: 0,
        switchAction: false,
        repeatConfiguration: 1,
        triggerAttribut: "",
        parentAttribute: "",
        callback: null,
        classesAdded: false,
        start: 1,
        end: 0,
        frequency: 1,
        addClasses: [],
        removeClasses: [],
        topAddClasses: []
    };

    /**
     * Supported easing modes for transitions.
     * @type {Array<string>}
     */
    window.supportedEasings = ["ease", "ease-in", "ease-out", "ease-in-out"];
})(); 