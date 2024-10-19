/**
 * DOMProcessor Class
 * 
 * The DOMProcessor class is designed to dynamically clone template elements (target-parent)
 * and populate them with content from source elements (source-parent) based on specified attributes.
 * It allows for flexible configurations, including attribute-based pairing, content transfer,
 * dynamic ordering, conditional processing based on visibility, and DOM cleanup after processing.
 * The class supports multiple configurations to process different sets of elements individually.
 * Additionally, it accommodates optional text and image attribute mappings, ensuring robust handling
 * even when certain content types are absent.
 * 
 * @version 1.1.0
 * @license MIT
 * 
 * ## Usage
 * 
 * Include this script via a CDN or local file, then instantiate the `DOMProcessor` class
 * with the desired configuration objects.
 * 
 * ```html
 * <!-- Source HTML -->
 * <div source-parent-1="1">
 *     <!-- Source group 1 -->
 *     <div class="source-group">
 *         <div source-txt-1="1">Sample Text 1</div>
 *         <img src="image1.jpg" source-img-1="1" alt="">
 *         <!-- More source elements -->
 *     </div>
 *     <!-- More source groups -->
 * </div>
 * 
 * <div source-parent-2="1">
 *     <!-- Source group 2 -->
 *     <div class="source-group">
 *         <div source-txt-2="1">Sample Text 2</div>
 *         <!-- No image for this group -->
 *         <!-- More source elements -->
 *     </div>
 *     <!-- More source groups -->
 * </div>
 * 
 * <!-- Template Elements -->
 * <div target-parent-1="1">
 *     <div target-txt-1="1"></div>
 *     <img target-img-1="1" alt="">
 *     <!-- More target elements -->
 * </div>
 * 
 * <div target-parent-2="1">
 *     <div target-txt-2="1"></div>
 *     <!-- No image target for this group -->
 *     <!-- More target elements -->
 * </div>
 * 
 * <!-- Include the script -->
 * <script src="path/to/domprocessor.js"></script>
 * <script>
 *     // Initialize the DOMProcessor with multiple configurations
 *     const domProcessor = new DOMProcessor(
 *         {
 *             sourceAttributes: [
 *                 { sourceContainerAttributeTxt: 'source-txt-1', targetContainerAttributeTxt: 'target-txt-1' },
 *                 { sourceContainerAttributeImg: 'source-img-1', targetContainerAttributeImg: 'target-img-1' }
 *             ],
 *             sourceParentAttribute: ['source-parent-1'],
 *             targetParentAttribute: ['target-parent-1'],
 *             orderTargetParent: ['1, 2'], // Single string with comma-separated values
 *             targetParentVisible: 'true' // This configuration will be processed normally
 *         },
 *         {
 *             sourceAttributes: [
 *                 { sourceContainerAttributeTxt: 'source-txt-2', targetContainerAttributeTxt: 'target-txt-2' }
 *                 // No image attributes for this configuration
 *             ],
 *             sourceParentAttribute: ['source-parent-2'],
 *             targetParentAttribute: ['target-parent-2'],
 *             orderTargetParent: ['3'], // Individual string
 *             targetParentVisible: 'false' // This configuration will be ignored and elements removed
 *         }
 *     );
 * </script>
 * ```
 * 
 * ## Configuration Options
 * 
 * Each configuration object passed to the DOMProcessor class can have the following properties:
 * 
 * | Property                  | Type                | Description                                                                                                 |
 * |---------------------------|---------------------|-------------------------------------------------------------------------------------------------------------|
 * | `sourceAttributes`        | `Array<Object>`     | An array of objects defining the mapping between source and target attributes for text and images.           |
 * | `sourceParentAttribute`   | `Array<string>`     | An array of attribute names used to identify source parent elements.                                         |
 * | `targetParentAttribute`   | `Array<string>`     | An array of attribute names used to identify target parent elements (templates).                             |
 * | `orderTargetParent`       | `Array<string>`     | An array of strings defining the order in which cloned elements should appear. Can be a single string with comma-separated values (e.g., `['1, 2, 5, 3']`) or multiple individual strings (e.g., `['1', '2', '5', '3']`). |
 * | `targetParentVisible`     | `string`            | Determines if the target parent should be processed. Can be `'true'` or `'false'`. If `'false'`, the source and target parent elements are removed from the DOM and the configuration is ignored. Default is `'true'`. |
 * 
 * ### Notes
 * 
 * - The class can accept multiple configuration objects, processing each set of elements individually.
 * - Content from elements with `source-txt-*` and `source-img-*` attributes is transferred to corresponding elements with `target-txt-*` and `target-img-*` attributes in the cloned templates.
 * - Text and image attribute mappings are optional; configurations can include only text, only images, both, or neither.
 * - The `orderTargetParent` parameter can accept either a single string with comma-separated values or an array of individual strings.
 * - After processing, the original templates and source parent elements are removed from the DOM for cleanliness.
 * - The `orderTargetParent` array can contain strings or numbers; values are parsed to integers.
 * 
 * ## Methods
 * 
 * | Method                                 | Description                                                                                       |
 * |----------------------------------------|---------------------------------------------------------------------------------------------------|
 * | `constructor(...configs)`              | Initializes the class with one or more configuration objects and starts the processing.           |
 * | `init()`                               | Main initialization method that processes each configuration individually.                        |
 * | `processConfig(config)`                | Processes a single configuration object, cloning templates, transferring content, and performing DOM cleanup based on visibility. |
 * | `processChild3(child3, clonedTargetParent, sourceAttributes)` | Transfers content from a source element to the corresponding target element in the cloned template based on the provided attribute mappings.|
 * | `removeElements(config)`               | Removes the source and target parent elements from the DOM based on the configuration when `targetParentVisible` is `'false'`. |
 * 
 * ## Example
 * 
 * ```html
 * <!-- Source HTML -->
 * <div source-parent-1="1">
 *     <!-- Source group 1 -->
 *     <div class="source-group">
 *         <div source-txt-1="1">Title 1</div>
 *         <img src="image1.jpg" source-img-1="1" alt="">
 *         <!-- More source elements -->
 *     </div>
 *     <!-- More source groups -->
 * </div>
 * 
 * <div source-parent-2="1">
 *     <!-- Source group 2 -->
 *     <div class="source-group">
 *         <div source-txt-2="1">Title 2</div>
 *         <!-- No image for this group -->
 *         <!-- More source elements -->
 *     </div>
 *     <!-- More source groups -->
 * </div>
 * 
 * <!-- Template Elements -->
 * <section target-parent-1="1">
 *     <h1 target-txt-1="1"></h1>
 *     <img target-img-1="1" alt="">
 *     <!-- More target elements -->
 * </section>
 * 
 * <section target-parent-2="1">
 *     <h1 target-txt-2="1"></h1>
 *     <!-- No image target for this group -->
 *     <!-- More target elements -->
 * </section>
 * 
 * <!-- Include the script -->
 * <script src="path/to/domprocessor.js"></script>
 * <script>
 *     const domProcessor = new DOMProcessor(
 *         {
 *             sourceAttributes: [
 *                 { sourceContainerAttributeTxt: 'source-txt-1', targetContainerAttributeTxt: 'target-txt-1' },
 *                 { sourceContainerAttributeImg: 'source-img-1', targetContainerAttributeImg: 'target-img-1' }
 *             ],
 *             sourceParentAttribute: ['source-parent-1'],
 *             targetParentAttribute: ['target-parent-1'],
 *             orderTargetParent: ['1, 2'], // Single string with comma-separated values
 *             targetParentVisible: 'true' // This configuration will be processed normally
 *         },
 *         {
 *             sourceAttributes: [
 *                 { sourceContainerAttributeTxt: 'source-txt-2', targetContainerAttributeTxt: 'target-txt-2' }
 *                 // No image attributes for this configuration
 *             ],
 *             sourceParentAttribute: ['source-parent-2'],
 *             targetParentAttribute: ['target-parent-2'],
 *             orderTargetParent: ['3'], // Individual string
 *             targetParentVisible: 'false' // This configuration will be ignored and elements removed
 *         }
 *     );
 * </script>
 * ```
 * 
 * In this example:
 * 
 * - The `DOMProcessor` is initialized with two configuration objects.
 * - The first configuration processes elements with `source-parent-1` and `target-parent-1`, transferring text and image content, and setting their order based on a single string with comma-separated values.
 * - The second configuration has `targetParentVisible` set to `'false'`, so elements with `source-parent-2` and `target-parent-2` are removed from the DOM without processing.
 * - After processing, the original templates and source parent elements are removed from the DOM, leaving only the cloned and processed target elements.
 * 
 * ## Exposing the Class Globally
 * 
 * The `DOMProcessor` class is exposed to the global scope, allowing it to be instantiated via a CDN or local script inclusion.
 * 
 * ```javascript
 * // Expose the class to the global scope
 * window.DOMProcessor = DOMProcessor;
 * ```
 */
class DOMProcessor {
    /**
     * Initializes the DOMProcessor with one or more configurations.
     * 
     * @param {...Object} configs - One or more configuration objects for the DOMProcessor.
     */
    constructor(...configs) {
        /**
         * Array of configuration objects.
         * @type {Array<Object>}
         */
        this.configs = configs;

        // Wait for DOMContentLoaded before starting the processing
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    /**
     * Initializes the processing by looping over each configuration
     * and processing them individually.
     */
    init() {
        this.configs.forEach(config => {
            this.processConfig(config);
        });
    }

    /**
     * Processes a single configuration object, cloning templates,
     * transferring content, and performing DOM cleanup based on visibility.
     * 
     * @param {Object} config - The configuration object to process.
     * @param {Array<Object>} config.sourceAttributes - Mapping between source and target attributes.
     * @param {Array<string>} config.sourceParentAttribute - Attributes to identify source parent elements.
     * @param {Array<string>} config.targetParentAttribute - Attributes to identify target parent elements.
     * @param {Array<string>} config.orderTargetParent - Order for cloned target parent elements.
     * @param {string} config.targetParentVisible - Determines if the target parent should be processed. Can be 'true' or 'false'. If 'false', the source and target parent elements are removed from the DOM and the configuration is ignored. Default is 'true'.
     */
    processConfig(config) {
        const {
            sourceAttributes = [],
            sourceParentAttribute = [],
            targetParentAttribute = [],
            orderTargetParent = [],
            targetParentVisible = 'true' // Default to 'true' if not specified
        } = config;

        // Check the visibility flag
        if (targetParentVisible === 'false') {
            // Remove the source and target parent elements from the DOM without processing
            this.removeElements(config);
            return;
        }

        // Check if targetParentAttribute is defined
        if (targetParentAttribute.length === 0) {
            console.error('No targetParentAttribute specified in configuration:', config);
            return;
        }

        const templateAttrName = targetParentAttribute[0]; // e.g., 'target-parent-1'
        const templateAttrValue = '1'; // Assumption: the template has target-parent="1"

        // Find the template target-parent container
        const template = document.querySelector(`[${templateAttrName}="${templateAttrValue}"]`);
        if (!template) {
            console.error(`Template with ${templateAttrName}="${templateAttrValue}" not found.`);
            return;
        }

        // Hide the template to prevent it from being visible before cloning
        template.style.display = 'none';

        // Initialize the orderIndex for assigning orderTargetParent values
        let orderIndex = 0;

        // Parse the orderTargetParent to handle comma-separated strings
        const parsedOrderTargetParent = [];
        orderTargetParent.forEach(entry => {
            if (typeof entry === 'string' && entry.includes(',')) {
                const splitEntries = entry.split(',').map(s => s.trim()).filter(s => s.length > 0);
                parsedOrderTargetParent.push(...splitEntries);
            } else if (typeof entry === 'string') {
                const trimmed = entry.trim();
                if (trimmed.length > 0) {
                    parsedOrderTargetParent.push(trimmed);
                }
            }
        });

        // Collect all sourceParent elements to remove them later
        const allSourceParents = [];

        // Process each sourceParentAttribute
        sourceParentAttribute.forEach((sourceParentAttr) => {
            // Find sourceParents based on the attribute
            const sourceParents = document.querySelectorAll(`[${sourceParentAttr}]`);
            sourceParents.forEach((sourceParent) => {
                allSourceParents.push(sourceParent); // Save for later removal

                // Find all source-groups within the sourceParent
                const sourceGroups = sourceParent.querySelectorAll('.w-dyn-item');

                sourceGroups.forEach((sourceGroup) => {
                    // Dynamically build selectors based on sourceAttributes
                    const childSelectors = sourceAttributes.map(attr => {
                        let selectors = [];
                        if (attr.sourceContainerAttributeTxt) {
                            selectors.push(`[${attr.sourceContainerAttributeTxt}]`);
                        }
                        if (attr.sourceContainerAttributeImg) {
                            selectors.push(`[${attr.sourceContainerAttributeImg}]`);
                        }
                        return selectors.join(', ');
                    }).filter(selector => selector).join(', ');

                    // Select all relevant child elements within the sourceGroup
                    const child3Elements = sourceGroup.querySelectorAll(childSelectors);
                    if (child3Elements.length === 0) return; // No relevant elements found

                    // Clone the template
                    const clonedTargetParent = template.cloneNode(true);
                    clonedTargetParent.style.display = ''; // Make the cloned element visible
                    clonedTargetParent.id = ''; // Remove the ID to avoid duplicates

                    // Set a unique target-parent attribute
                    const newTargetParentValue = orderIndex + 1; // Unique value based on orderIndex
                    clonedTargetParent.setAttribute(templateAttrName, newTargetParentValue);

                    // Append the cloned Target Parent after the template in the DOM
                    template.parentNode.appendChild(clonedTargetParent);

                    // Set the order of the target parent based on parsedOrderTargetParent
                    let order = parsedOrderTargetParent[orderIndex];
                    if (order !== undefined) {
                        // Parse the order value to an integer
                        order = parseInt(order, 10);
                        if (!isNaN(order)) {
                            clonedTargetParent.style.order = order;
                        } else {
                            console.warn(`Invalid order value at position ${orderIndex}:`, order);
                        }
                    }

                    // Increment the orderIndex for the next cloned element
                    orderIndex++;

                    // Transfer the content from source to target
                    child3Elements.forEach(child3 => {
                        this.processChild3(child3, clonedTargetParent, sourceAttributes);
                    });
                });
            });
        });

        // Remove the template from the DOM to keep it clean
        template.parentNode.removeChild(template);

        // Remove all sourceParent elements from the DOM to keep it clean
        allSourceParents.forEach(sourceParent => {
            sourceParent.parentNode.removeChild(sourceParent);
        });
    }

    /**
     * Transfers content from a source element to the corresponding target element
     * in the cloned template based on the provided attribute mappings.
     * 
     * @param {HTMLElement} child3 - The source element with content to transfer.
     * @param {HTMLElement} clonedTargetParent - The cloned template element.
     * @param {Array<Object>} sourceAttributes - Mapping between source and target attributes.
     */
    processChild3(child3, clonedTargetParent, sourceAttributes) {
        let type, key, value, targetAttribute;

        // Iterate over sourceAttributes to find matching attributes
        sourceAttributes.forEach(attr => {
            if (attr.sourceContainerAttributeTxt && child3.hasAttribute(attr.sourceContainerAttributeTxt)) {
                type = 'txt';
                key = child3.getAttribute(attr.sourceContainerAttributeTxt);
                value = child3.textContent;
                targetAttribute = attr.targetContainerAttributeTxt;
            }
            if (attr.sourceContainerAttributeImg && child3.hasAttribute(attr.sourceContainerAttributeImg)) {
                type = 'img';
                key = child3.getAttribute(attr.sourceContainerAttributeImg);
                value = child3.src;
                targetAttribute = attr.targetContainerAttributeImg;
            }
        });

        // If key or targetAttribute is missing, skip processing
        if (!key || !targetAttribute) return;

        // Find the corresponding target within the cloned Target Parent
        const targetSelector = `[${targetAttribute}="${key}"]`;
        const targetContainers = clonedTargetParent.querySelectorAll(targetSelector);

        // Transfer the content based on the type
        targetContainers.forEach(targetContainer => {
            if (type === 'txt') {
                targetContainer.textContent = value;
            } else if (type === 'img') {
                targetContainer.src = value;
            }
        });
    }

    /**
     * Removes the source and target parent elements from the DOM based on the configuration.
     * This is used when `targetParentVisible` is set to 'false'.
     * 
     * @param {Object} config - The configuration object whose elements are to be removed.
     * @param {Array<string>} config.sourceParentAttribute - Attributes to identify source parent elements.
     * @param {Array<string>} config.targetParentAttribute - Attributes to identify target parent elements.
     */
    removeElements(config) {
        const { sourceParentAttribute = [], targetParentAttribute = [] } = config;

        // Remove all source parent elements
        sourceParentAttribute.forEach(sourceParentAttr => {
            const sourceParents = document.querySelectorAll(`[${sourceParentAttr}]`);
            sourceParents.forEach(sourceParent => {
                if (sourceParent.parentNode) {
                    sourceParent.parentNode.removeChild(sourceParent);
                }
            });
        });

        // Remove all target parent elements
        targetParentAttribute.forEach(targetParentAttr => {
            const targetParents = document.querySelectorAll(`[${targetParentAttr}]`);
            targetParents.forEach(targetParent => {
                if (targetParent.parentNode) {
                    targetParent.parentNode.removeChild(targetParent);
                }
            });
        });
    }
}

// Expose the class to the global scope
window.DOMProcessor = DOMProcessor;
