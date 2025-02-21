# Webflow Front-End Library

A collection of lightweight, modular JavaScript utilities designed to enhance Webflow websites with advanced functionality and improved user experience. This library provides optimized solutions for common front-end challenges while maintaining performance and flexibility.

## Available Components

### Core Utilities

1. **DOMProcessor**
   - Efficient DOM manipulation and element processing
   - Foundation for other components in the library

2. **ScrollManager**
   - Advanced scroll-based functionality
   - Handles scroll events and triggers
   - Optimized for performance

### Interactive Components

1. **CustomSlider**
   - Lightweight alternative to Webflow's native slider
   - Customizable transitions and animations
   - Touch-friendly and responsive

2. **ElementFilter**
   - Dynamic filtering system for collections
   - Smooth transitions between filtered states
   - Support for multiple filter criteria

3. **CustomCursor**
   - Enhanced cursor interactions
   - Custom cursor styles and behaviors
   - Smooth movement and transitions

### Animation & Visual Effects

1. **ScrollLetter**
   - Letter-by-letter scroll animations
   - Customizable timing and effects
   - Smooth text reveal on scroll

2. **SpanFadeInStagger**
   - Staggered fade-in animations for text elements
   - Configurable delay and duration
   - Smooth, performance-optimized transitions

3. **Typewriter**
   - Text typing animation effect
   - Configurable speed and delays
   - Support for multiple text strings

### Layout & Structure

1. **UniversalAutoHeight**
   - Dynamic height adjustment for elements
   - Smooth transitions between states
   - Responsive layout management

2. **ClassConfig**
   - Dynamic class management system
   - Efficient state handling
   - Easy integration with Webflow's class system

## Installation

1. Choose the component(s) you need from the `/min` directory
2. Add the minified JavaScript file(s) to your Webflow project:
   - Navigate to your project settings
   - Add the script in the "Custom Code" section of your page or in site-wide settings
   - Alternatively, use them in your exported Webflow site

## Usage

Each component is designed to work independently or in combination with others. Minified versions are available in the `/min` directory for production use, while the raw source files in `/raw` are available for reference or customization.

### Example Implementation

```javascript
// Initialize a custom slider
const slider = new CustomSlider({
    container: '.slider-container',
    slides: '.slide',
    options: {
        // Your configuration options
    }
});

// Set up a filter system
const filter = new ElementFilter({
    filterButtons: '.filter-button',
    items: '.filter-item',
    activeClass: 'active'
});
```

## Performance

All components are optimized for performance with:
- Minimal DOM operations
- Efficient event handling
- Optimized animations
- Small file sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

"THE BEER-WARE LICENSE" (Revision 42):
As long as you retain this notice you can do whatever you want with this stuff.
If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.

## Contributing

This is a personal library maintained for specific use cases. While it's open for use, it's not currently accepting contributions. Feel free to fork and modify for your own needs.
