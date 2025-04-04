/**
 * Tests for ComboClassConfigurator Class
 */

describe('ComboClassConfigurator', () => {
  let configurator;
  let mockConfigs;

  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="parent" class="parent-container">
        <button id="trigger" class="trigger-btn">Click me</button>
      </div>
    `;

    mockConfigs = [
      {
        eventName: "click",
        parentElement: ".parent-container",
        triggerElement: ".trigger-btn",
        addClasses: ["active"],
        removeClasses: ["inactive"],
        callback: jest.fn()
      }
    ];

    configurator = new ComboClassConfigurator(mockConfigs);
  });

  describe('constructor', () => {
    it('should throw error if configs is not an array', () => {
      expect(() => new ComboClassConfigurator({})).toThrow("Invalid classConfigs parameter. An array is expected.");
    });

    it('should initialize with valid configs', () => {
      expect(configurator.initialConfigs).toEqual(mockConfigs);
      expect(configurator.classConfigs).toBeInstanceOf(Array);
      expect(configurator.scrollObservers).toBeInstanceOf(Map);
    });
  });

  describe('_validateThreshold', () => {
    it('should return default value for non-number input', () => {
      expect(configurator._validateThreshold("invalid", 50)).toBe(50);
    });

    it('should return default value for out of range input', () => {
      expect(configurator._validateThreshold(150, 50)).toBe(50);
      expect(configurator._validateThreshold(-10, 50)).toBe(50);
    });

    it('should return input value for valid input', () => {
      expect(configurator._validateThreshold(75, 50)).toBe(75);
    });
  });

  describe('_cleanClasses', () => {
    it('should clean and filter class names', () => {
      const classes = [".class1", "class2", "  class3  ", ""];
      expect(configurator._cleanClasses(classes)).toEqual(["class1", "class2", "class3"]);
    });

    it('should return empty array for non-array input', () => {
      expect(configurator._cleanClasses(null)).toEqual([]);
    });
  });

  describe('event handling', () => {
    it('should handle click events correctly', () => {
      const trigger = document.querySelector('.trigger-btn');
      trigger.click();
      expect(trigger.classList.contains('active')).toBe(true);
    });

    it('should handle hover events correctly', () => {
      const trigger = document.querySelector('.trigger-btn');
      const event = new Event('mouseenter');
      trigger.dispatchEvent(event);
      expect(trigger.classList.contains('active')).toBe(true);
    });
  });
}); 