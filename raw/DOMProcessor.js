/**
 * DOMProcessor Class
 *
 * Dynamically clones template elements ("target-parent") and populates them with content from source elements ("source-parent")
 * based on specified attribute mappings.
 *
 * Options:
 * - sourceAttributes (Array<Object>): An array of mapping objects. Each object may contain:
 *    - sourceContainerAttributeTxt (string): Attribute name for source text content.
 *    - targetContainerAttributeTxt (string): Attribute name for target text element.
 *    - sourceContainerAttributeImg (string): Attribute name for source image URL.
 *    - targetContainerAttributeImg (string): Attribute name for target image element.
 * - sourceParentAttribute (Array<string>): An array of attribute names used to select source parent elements.
 * - targetParentAttribute (Array<string>): An array of attribute names identifying template (target) parent elements.
 * - orderTargetParent (Array<string>|string): Either an array or a comma-separated string defining the order of cloned elements.
 * - targetParentVisible (string): "true" or "false". If "false", source and target elements are removed.
 *
 * Example instantiation (asynchron sicher über CDN):
 * window.addEventListener('DOMContentLoaded', () => {
 *   const domProcessor = new DOMProcessor({
 *     sourceAttributes: [
 *       { sourceContainerAttributeTxt: 'source-txt-1', targetContainerAttributeTxt: 'target-txt-1' },
 *       { sourceContainerAttributeImg: 'source-img-1', targetContainerAttributeImg: 'target-img-1' }
 *     ],
 *     sourceParentAttribute: ['source-parent-1'],
 *     targetParentAttribute: ['target-parent-1'],
 *     orderTargetParent: '1, 2, 3',
 *     targetParentVisible: 'true'
 *   });
 * });
 *
 * @version 1.1.0
 * @license MIT
 */
class DOMProcessor {
  constructor(...configs) {
    this.configs = configs;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  init() {
    this.configs.forEach(config => this.processConfig(config));
  }
  
  processConfig(config) {
    const {
      sourceAttributes = [],
      sourceParentAttribute = [],
      targetParentAttribute = [],
      orderTargetParent = [],
      targetParentVisible = 'true'
    } = config;
  
    if (targetParentVisible === 'false') {
      this.removeElements(config);
      return;
    }
  
    if (targetParentAttribute.length === 0) {
      console.error('No targetParentAttribute specified in configuration:', config);
      return;
    }
  
    const templateAttrName = targetParentAttribute[0];
    const templateAttrValue = '1';
    const template = document.querySelector(`[${templateAttrName}="${templateAttrValue}"]`);
    if (!template) {
      console.error(`Template with ${templateAttrName}="${templateAttrValue}" not found.`);
      return;
    }
    template.style.display = 'none';
  
    let orderIndex = 0;
    const parsedOrderTargetParent = [];
    if (typeof orderTargetParent === 'string') {
      parsedOrderTargetParent.push(...orderTargetParent.split(',').map(s => s.trim()).filter(s => s.length > 0));
    } else if (Array.isArray(orderTargetParent)) {
      orderTargetParent.forEach(entry => {
        if (typeof entry === 'string' && entry.includes(',')) {
          const splitEntries = entry.split(',').map(s => s.trim()).filter(s => s.length > 0);
          parsedOrderTargetParent.push(...splitEntries);
        } else if (typeof entry === 'string') {
          parsedOrderTargetParent.push(entry.trim());
        }
      });
    }
  
    const allSourceParents = [];
    sourceParentAttribute.forEach(sourceParentAttr => {
      const sourceParents = document.querySelectorAll(`[${sourceParentAttr}]`);
      sourceParents.forEach(sourceParent => {
        allSourceParents.push(sourceParent);
        const sourceGroups = sourceParent.querySelectorAll('.w-dyn-item');
        sourceGroups.forEach(sourceGroup => {
          const childSelectors = sourceAttributes
            .map(attr => {
              let selectors = [];
              if (attr.sourceContainerAttributeTxt) {
                selectors.push(`[${attr.sourceContainerAttributeTxt}]`);
              }
              if (attr.sourceContainerAttributeImg) {
                selectors.push(`[${attr.sourceContainerAttributeImg}]`);
              }
              return selectors.join(', ');
            })
            .filter(selector => selector)
            .join(', ');
  
          const child3Elements = sourceGroup.querySelectorAll(childSelectors);
          if (child3Elements.length === 0) return;
  
          const clonedTargetParent = template.cloneNode(true);
          clonedTargetParent.style.display = '';
          clonedTargetParent.id = '';
          const newTargetParentValue = orderIndex + 1;
          clonedTargetParent.setAttribute(templateAttrName, newTargetParentValue);
          template.parentNode.appendChild(clonedTargetParent);
  
          let order = parsedOrderTargetParent[orderIndex];
          if (order !== undefined) {
            order = parseInt(order, 10);
            if (!isNaN(order)) {
              clonedTargetParent.style.order = order;
            } else {
              console.warn(`Invalid order value at position ${orderIndex}:`, order);
            }
          }
          orderIndex++;
  
          child3Elements.forEach(child3 => {
            this.processChild3(child3, clonedTargetParent, sourceAttributes);
          });
        });
      });
    });
  
    template.parentNode.removeChild(template);
    allSourceParents.forEach(sourceParent => {
      sourceParent.parentNode.removeChild(sourceParent);
    });
  }
  
  processChild3(child3, clonedTargetParent, sourceAttributes) {
    let type, key, value, targetAttribute;
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
  
    if (!key || !targetAttribute) return;
    const targetSelector = `[${targetAttribute}="${key}"]`;
    const targetContainers = clonedTargetParent.querySelectorAll(targetSelector);
    targetContainers.forEach(targetContainer => {
      if (type === 'txt') {
        targetContainer.textContent = value;
      } else if (type === 'img') {
        targetContainer.src = value;
      }
    });
  }
  
  removeElements(config) {
    const { sourceParentAttribute = [], targetParentAttribute = [] } = config;
    sourceParentAttribute.forEach(sourceParentAttr => {
      const sourceParents = document.querySelectorAll(`[${sourceParentAttr}]`);
      sourceParents.forEach(sourceParent => {
        if (sourceParent.parentNode) {
          sourceParent.parentNode.removeChild(sourceParent);
        }
      });
    });
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
window.DOMProcessor = DOMProcessor;
