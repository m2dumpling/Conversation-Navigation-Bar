---
name: chrome-extension
description: Assists with Chrome extension development, including manifest.json configuration, content scripts, background scripts, and extension APIs. Use when working on Chrome browser extensions.
---

# Chrome Extension Development Skill

This skill provides guidance for developing Chrome extensions, following Manifest V3 best practices.

## When to use this skill

- Creating or modifying Chrome extension manifest.json
- Writing content scripts that interact with web pages
- Implementing background service workers
- Working with Chrome extension APIs
- Debugging extension issues

## Project Context

This is a Chrome extension project with the following structure:
- `manifest.json` - Extension configuration (Manifest V3)
- `src/content/` - Content scripts that run on web pages
- `icons/` - Extension icons for Chrome toolbar and management page

## Key Guidelines

### Manifest V3 Requirements
- Use `"manifest_version": 3`
- Use `service_worker` instead of background pages
- Use `host_permissions` for URL access
- Content scripts should be defined in `content_scripts` array

### Content Script Best Practices
1. **DOM Access**: Content scripts have full access to the page DOM
2. **MutationObserver**: Use for detecting DOM changes in SPAs
3. **IntersectionObserver**: Use for detecting element visibility
4. **Isolated World**: Content scripts run in isolated context from page scripts

### Selectors for Supported Platforms
- **Gemini**: `user-query`, `.query-text`, `.conversation-container`
- **ChatGPT**: `[data-message-author-role="user"]`

### Debugging
- Use `console.log` with prefix `[OCN]` for consistent logging
- Check `chrome://extensions/` for extension errors
- Use browser DevTools for debugging content scripts

## Best Practices

1. Always test on both supported platforms (ChatGPT and Gemini)
2. Handle dynamic content loading with appropriate observers
3. Use smooth scrolling with `scrollIntoView({ behavior: 'smooth' })`
4. Implement graceful degradation if DOM structure changes
5. Keep the UI non-intrusive with hover interactions
