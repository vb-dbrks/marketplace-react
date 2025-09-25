# Contributing to Data Marketplace

Thank you for your interest in contributing to the Data Marketplace project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git
- Basic knowledge of React and FastAPI

### Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/data-marketplace.git
   cd data-marketplace
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Frontend Setup** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow conventional commit format:
- `feat: add new search functionality`
- `fix: resolve database connection issue`
- `docs: update README with new features`
- `refactor: improve component structure`

### Pull Request Process

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**:
   - Write clean, readable code
   - Add tests if applicable
   - Update documentation

3. **Test Your Changes**:
   ```bash
   # Backend tests
   cd backend
   python -m pytest
   
   # Frontend tests
   cd frontend
   npm test
   ```

4. **Submit a Pull Request**:
   - Provide a clear description
   - Reference any related issues
   - Include screenshots for UI changes

## 📝 Code Standards

### Backend (Python/FastAPI)
- Follow PEP 8 style guidelines
- Use type hints where possible
- Add docstrings for functions and classes
- Handle errors gracefully

### Frontend (React)
- Use functional components with hooks
- Follow Material-UI design patterns
- Keep components small and focused
- Use proper prop types

### Database
- Use SQLAlchemy models for database operations
- Follow naming conventions (snake_case for tables)
- Add proper indexes for performance

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Integration Testing
- Test both JSON and PostgreSQL modes
- Verify API endpoints work correctly
- Test deployment scripts

## 📚 Documentation

### Code Documentation
- Add docstrings to Python functions
- Comment complex logic
- Update README for new features

### API Documentation
- FastAPI automatically generates docs at `/docs`
- Keep endpoint descriptions up to date
- Document any breaking changes

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node versions)
- Screenshots if applicable

## 💡 Feature Requests

For feature requests:
- Check existing issues first
- Provide clear use case
- Consider implementation complexity
- Discuss with maintainers

## 🔒 Security

- Never commit credentials or API keys
- Use environment variables for sensitive data
- Report security issues privately
- Follow security best practices

## 📞 Getting Help

- Check existing [Issues](https://github.com/your-username/data-marketplace/issues)
- Join discussions in [Discussions](https://github.com/your-username/data-marketplace/discussions)
- Create a new issue for questions

## 🎉 Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes
- GitHub contributors list

Thank you for contributing to Data Marketplace! 🚀
