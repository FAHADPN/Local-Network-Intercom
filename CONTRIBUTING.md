# Contributing to Tradelink Intercom

Thank you for your interest in contributing to Tradelink Intercom! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker to report bugs
- Include detailed steps to reproduce the issue
- Provide browser version, OS, and any error messages
- Check existing issues before creating new ones

### Feature Requests
- Describe the feature you'd like to see
- Explain why this feature would be useful
- Consider the impact on local network communication
- Provide examples or mockups if possible

### Code Contributions
- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Make your changes following the coding standards
- Test your changes thoroughly
- Submit a pull request with a clear description

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16+) or Bun (recommended)
- Modern web browser with WebRTC support
- Git for version control

### Local Development
1. Fork and clone the repository
2. Install dependencies: `bun install`
3. Start development server: `bun run dev`
4. Open `http://localhost:3000` in your browser
5. Make your changes and test them

### Testing
- Test in multiple browsers (Chrome, Firefox, Edge, Safari)
- Test on different devices and screen sizes
- Verify WebRTC functionality works correctly
- Check that PWA features still function

## 📝 Coding Standards

### JavaScript
- Use ES6+ features and modern syntax
- Follow consistent naming conventions
- Add JSDoc comments for complex functions
- Handle errors gracefully with user-friendly messages

### CSS
- Use BEM methodology for class naming
- Keep styles organized and maintainable
- Use CSS custom properties for theming
- Ensure responsive design principles

### HTML
- Use semantic HTML5 elements
- Maintain accessibility standards
- Keep markup clean and readable
- Include proper ARIA labels where needed

### General
- Write clear, descriptive commit messages
- Keep functions focused and single-purpose
- Add appropriate error handling
- Include inline comments for complex logic

## 🎯 Areas for Contribution

### Frontend
- UI/UX improvements
- Accessibility enhancements
- Performance optimizations
- Cross-browser compatibility

### Backend
- Server performance improvements
- Better error handling
- Additional API endpoints
- Security enhancements

### WebRTC
- Audio quality improvements
- Connection reliability
- Network traversal
- Media handling

### Documentation
- Code documentation
- User guides
- API documentation
- Troubleshooting guides

## 🔒 Security Considerations

- All communication stays on local networks
- No external data transmission
- Secure WebRTC implementation
- Privacy-focused design

## 📋 Pull Request Guidelines

### Before Submitting
- Ensure all tests pass
- Test in multiple browsers
- Verify WebRTC functionality
- Check for any console errors

### Pull Request Template
- Clear description of changes
- Screenshots for UI changes
- Testing instructions
- Any breaking changes noted

### Code Review
- Address review comments promptly
- Keep commits focused and logical
- Maintain clean git history
- Respond to feedback constructively

## 🚀 Release Process

### Versioning
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md with changes
- Tag releases appropriately
- Update package.json version

### Testing
- Test in multiple environments
- Verify all features work correctly
- Check for regressions
- Validate PWA functionality

## 📞 Getting Help

### Questions
- Check existing documentation
- Review GitHub issues and discussions
- Ask questions in GitHub discussions
- Contact maintainers for complex issues

### Resources
- WebRTC documentation
- Socket.IO guides
- PWA best practices
- Modern JavaScript patterns

## 🙏 Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Acknowledged in the CHANGELOG.md
- Given credit in commit history

---

Thank you for contributing to Tradelink Intercom! Your contributions help make local network communication better for everyone.
