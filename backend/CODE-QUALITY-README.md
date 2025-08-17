# Code Quality Setup for MyNewPlaylist Backend

This document explains the comprehensive code quality setup implemented using modern Python tools and pre-commit hooks.

## 🚀 **What's Included**

### **1. Code Formatting**
- **Black**: Uncompromising Python code formatter
- **isort**: Import sorting and organization
- **Line Length**: 88 characters (Black's default)

### **2. Linting & Analysis**
- **Flake8**: Style guide enforcement
- **Pylint**: Advanced code analysis
- **Bandit**: Security vulnerability detection
- **Safety**: Dependency vulnerability checking

### **3. Type Checking**
- **MyPy**: Static type checking with strict mode
- **Type Annotations**: Comprehensive type coverage
- **Strict Configuration**: No implicit any, strict equality

### **4. Testing & Coverage**
- **Pytest**: Modern testing framework
- **Pytest-cov**: Coverage reporting
- **Pytest-asyncio**: Async testing support
- **HTML Coverage Reports**: Visual coverage analysis

### **5. Pre-commit Hooks**
- **Automatic Checks**: Run on every commit
- **Quality Gates**: Prevent low-quality code
- **Security Scanning**: Automated vulnerability detection

## 🔧 **Installation & Setup**

### **1. Install Dependencies**

```bash
# Install development dependencies
make install-dev

# Or manually
pip install -r requirements-dev.txt
```

### **2. Install Pre-commit Hooks**

```bash
# Install hooks
make install-hooks

# Or manually
pre-commit install
pre-commit install --hook-type commit-msg
```

### **3. Verify Installation**

```bash
# Check available commands
make help

# Run all checks
make check-all
```

## 📋 **Available Commands**

### **Make Commands (Recommended)**

```bash
# Code Quality
make format          # Format code with Black and isort
make lint            # Run all linting tools
make type-check      # Run MyPy type checking
make check-all       # Run all checks

# Testing
make test            # Run tests
make test-cov        # Run tests with coverage

# Development
make dev             # Start development server
make prod            # Start production server

# Maintenance
make clean           # Clean up cache files
make install-hooks   # Install pre-commit hooks
```

### **Direct Tool Commands**

```bash
# Formatting
black .              # Format with Black
isort .              # Sort imports

# Linting
flake8 .             # Run Flake8
pylint *.py          # Run Pylint
bandit -r .          # Security analysis
safety check         # Vulnerability check

# Type Checking
mypy .               # Run MyPy

# Testing
pytest               # Run tests
pytest --cov=.       # With coverage
```

## 🎯 **Code Quality Rules**

### **Black Formatting**
- **Line Length**: 88 characters
- **Quotes**: Double quotes for strings
- **Spacing**: Consistent spacing around operators
- **Line Breaks**: Automatic line breaking

### **Import Organization (isort)**
```python
# Standard library imports
import os
import sys
from typing import List, Optional

# Third-party imports
import fastapi
import psycopg
from pydantic import BaseModel

# Local imports
from .models import Song
from .database import get_db
```

### **Type Annotations (MyPy)**
```python
from typing import List, Optional, Dict, Any

def get_songs(limit: int = 10) -> List[Song]:
    """Get songs from database."""
    pass

def create_playlist(name: str, songs: List[str]) -> Optional[Playlist]:
    """Create a new playlist."""
    pass

def update_song(song_id: str, data: Dict[str, Any]) -> bool:
    """Update song data."""
    pass
```

### **Linting Rules**
- **Flake8**: PEP 8 compliance
- **Pylint**: Code complexity and best practices
- **Bandit**: Security best practices
- **Safety**: Known vulnerabilities

## 🔍 **Pre-commit Hooks**

### **What Runs on Commit**
1. **Black**: Code formatting
2. **isort**: Import sorting
3. **Flake8**: Style checking
4. **MyPy**: Type checking
5. **Pylint**: Code analysis
6. **Bandit**: Security scanning
7. **Safety**: Vulnerability check
8. **File Checks**: Whitespace, YAML, merge conflicts

### **Hook Configuration**
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        args: [--line-length=88]
```

### **Bypassing Hooks (Emergency)**
```bash
# Skip pre-commit hooks
git commit -m "message" --no-verify
```

⚠️ **Warning**: Only use `--no-verify` in emergencies.

## 🧪 **Testing Setup**

### **Test Structure**
```
tests/
├── __init__.py
├── conftest.py          # Test configuration
├── test_main.py         # Main API tests
├── test_analytics.py    # Analytics tests
└── test_database.py     # Database tests
```

### **Running Tests**
```bash
# All tests
make test

# With coverage
make test-cov

# Specific test file
pytest tests/test_main.py

# With verbose output
pytest -v

# Stop on first failure
pytest -x
```

### **Test Markers**
```python
import pytest

@pytest.mark.slow
def test_expensive_operation():
    """This test is marked as slow."""
    pass

@pytest.mark.integration
def test_database_integration():
    """This test requires database."""
    pass

@pytest.mark.unit
def test_unit_function():
    """This is a unit test."""
    pass
```

## 📊 **Coverage Reports**

### **HTML Coverage Report**
```bash
make test-cov
# Opens htmlcov/index.html in browser
```

### **Coverage Configuration**
```toml
[tool.coverage.run]
source = ["."]
omit = [
    "*/tests/*",
    "*/__pycache__/*",
    "*/venv/*",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "if self.debug:",
]
```

## 🛠️ **Configuration Files**

### **pyproject.toml**
- **Black**: Code formatting rules
- **isort**: Import sorting rules
- **MyPy**: Type checking rules
- **Pytest**: Testing configuration
- **Coverage**: Coverage settings
- **Flake8**: Linting rules
- **Pylint**: Analysis rules

### **.pre-commit-config.yaml**
- **Hook Definitions**: All quality check hooks
- **Tool Versions**: Specific tool versions
- **Arguments**: Custom tool arguments
- **Exclusions**: Files to skip

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Pre-commit Hooks Not Running**
   ```bash
   # Reinstall hooks
   make install-hooks
   ```

2. **Black Formatting Issues**
   ```bash
   # Format manually
   make format
   ```

3. **MyPy Type Errors**
   ```bash
   # Check types
   make type-check
   ```

4. **Import Sorting Issues**
   ```bash
   # Sort imports
   isort .
   ```

### **Performance Issues**

1. **Slow Pre-commit Hooks**
   ```bash
   # Skip slow hooks temporarily
   pre-commit run --all-files --hook-stage manual
   ```

2. **Large Codebase**
   ```bash
   # Run hooks on specific files
   pre-commit run --files path/to/file.py
   ```

## 📈 **Quality Metrics**

### **Code Coverage**
- **Target**: 80%+ coverage
- **Reports**: HTML and terminal output
- **Exclusions**: Tests, debug code, utilities

### **Linting Score**
- **Flake8**: 0 errors, 0 warnings
- **Pylint**: 8.0+ score
- **MyPy**: 0 type errors

### **Security Score**
- **Bandit**: 0 high-severity issues
- **Safety**: 0 known vulnerabilities

## 🚀 **Best Practices**

1. **Run Checks Locally**: Use `make check-all` before pushing
2. **Fix Issues Early**: Address linting errors immediately
3. **Write Tests**: Maintain good test coverage
4. **Type Everything**: Use type annotations consistently
5. **Follow Standards**: Adhere to PEP 8 and project conventions

## 🔮 **Future Enhancements**

- **Quality Gates**: Minimum coverage thresholds
- **Automated Reviews**: Bot-based code review
- **Performance Monitoring**: Response time tracking
- **Security Scanning**: Advanced vulnerability detection
- **Documentation Generation**: Auto-generated API docs

## 📚 **Additional Resources**

- [Black Documentation](https://black.readthedocs.io/)
- [isort Documentation](https://pycqa.github.io/isort/)
- [MyPy Documentation](https://mypy.readthedocs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Pre-commit Documentation](https://pre-commit.com/)

---

*This code quality setup ensures your Python backend maintains high standards of code quality, security, and maintainability. Follow the guidelines and your codebase will remain professional and robust.*
