# Contributing to Temporal Focus

Thank you for your interest in contributing to Temporal Focus! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

- Use the [GitHub issue tracker](../../issues) to report bugs or suggest features
- Before creating a new issue, please search existing issues to avoid duplicates
- Provide detailed information including:
  - Your macOS version
  - Steps to reproduce the issue
  - Expected vs. actual behavior
  - Screenshots if applicable

### Development Setup

1. **Fork the repository** and clone your fork
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development version**:
   ```bash
   npm run dev
   ```

### Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with clear, descriptive messages
5. **Push to your fork** and submit a pull request

### Pull Request Guidelines

- Keep pull requests focused on a single feature or fix
- Include a clear description of what changes were made and why
- Make sure all tests pass
- Update documentation if necessary
- Follow the existing code style and conventions

## 🛠️ Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing formatting conventions
- Use meaningful variable and function names
- Add comments for complex logic

### Project Structure

```
src/
├── main/          # Electron main process
├── renderer/      # Frontend UI code
└── assets/        # Application assets

scripts/           # Build and utility scripts
assets/            # DMG and build assets
docs/             # Documentation
```

### Testing

- Test your changes on both Intel and Apple Silicon Macs if possible
- Verify that the DMG build process works correctly
- Test edge cases and error conditions

## 📝 Commit Messages

Use clear, descriptive commit messages:

- `feat: add new feature`
- `fix: resolve issue with X`
- `docs: update README`
- `refactor: improve code structure`
- `chore: update dependencies`

## 🚀 Release Process

Releases are handled by the maintainer and follow semantic versioning:

- `1.0.0` - Major version (breaking changes)
- `1.1.0` - Minor version (new features)
- `1.1.1` - Patch version (bug fixes)

## 📞 Getting Help

If you need help or have questions:

- Open a [GitHub discussion](../../discussions)
- Email the maintainer: [seva@sevamouler.com](mailto:seva@sevamouler.com)

## 📄 License

By contributing to Temporal Focus, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉 