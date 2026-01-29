---
name: ui-design
description: Provides guidelines for creating modern, glassmorphism-style UI components. Use when designing or styling navigation bars, overlays, or interactive elements.
---

# UI Design Skill - Glassmorphism Style

This skill provides guidelines for creating modern, elegant UI components with glassmorphism effects.

## When to use this skill

- Creating navigation components
- Implementing hover effects and micro-animations
- Designing overlay elements
- Styling with CSS blur and transparency effects

## Design Principles

### Glassmorphism Effect
```css
/* Standard glassmorphism style */
.glass-element {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
}
```

### Color Guidelines
- Background: Use semi-transparent backgrounds with `rgba()`
- Blur: 8-15px for subtle blur, 20-30px for strong blur
- Border: Subtle white borders with low opacity (0.1-0.3)

### Animation Best Practices
1. **Duration**: 200-300ms for hover effects
2. **Easing**: Use `ease-in-out` or `cubic-bezier` for smooth transitions
3. **Transform**: Prefer `transform` and `opacity` for performance

### Hover Interactions
```css
.nav-item {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.nav-item:hover {
    transform: scale(1.05);
    opacity: 1;
}
```

## Navigation Bar Design

### Collapsed State
- Show minimal indicators (dots)
- Maximum 8 visible items when collapsed
- Subtle opacity

### Expanded State
- Full text display on hover
- Smooth width transition
- Clear active state indication

## Accessibility
- Ensure sufficient contrast
- Provide hover/focus states
- Use semantic HTML elements
