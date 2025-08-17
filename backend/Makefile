.PHONY: help install install-dev format lint type-check test test-cov clean install-hooks

# Default target
help:
	@echo "Available commands:"
	@echo "  install        - Install production dependencies"
	@echo "  install-dev    - Install development dependencies"
	@echo "  install-hooks  - Install pre-commit hooks"
	@echo "  format         - Format code with Black and isort"
	@echo "  lint           - Run all linting tools"
	@echo "  type-check     - Run MyPy type checking"
	@echo "  test           - Run tests"
	@echo "  test-cov       - Run tests with coverage"
	@echo "  clean          - Clean up cache and temporary files"
	@echo "  check-all      - Run all checks (format, lint, type-check, test)"

# Install production dependencies
install:
	pip install -r requirements.txt

# Install development dependencies
install-dev:
	pip install -r requirements-dev.txt

# Install pre-commit hooks
install-hooks:
	pre-commit install
	pre-commit install --hook-type commit-msg

# Format code
format:
	@echo "🔍 Formatting code with Black..."
	black .
	@echo "📝 Sorting imports with isort..."
	isort .
	@echo "✅ Code formatting complete!"

# Run all linting tools
lint:
	@echo "🔍 Running Flake8..."
	flake8 .
	@echo "🔍 Running Pylint..."
	pylint *.py
	@echo "🔍 Running Bandit (security)..."
	bandit -r . -f json -o bandit-report.json || true
	@echo "🔍 Running Safety (vulnerability check)..."
	safety check --full-report || true
	@echo "✅ Linting complete!"

# Run type checking
type-check:
	@echo "🔍 Running MyPy type checking..."
	mypy .
	@echo "✅ Type checking complete!"

# Run tests
test:
	@echo "🧪 Running tests..."
	pytest

# Run tests with coverage
test-cov:
	@echo "🧪 Running tests with coverage..."
	pytest --cov=. --cov-report=html --cov-report=term-missing
	@echo "📊 Coverage report generated in htmlcov/"

# Run all checks
check-all: format lint type-check test
	@echo "🎉 All checks passed!"

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	find . -type d -name "htmlcov" -exec rm -rf {} +
	find . -type f -name ".coverage" -delete
	find . -type f -name "bandit-report.json" -delete
	@echo "✅ Cleanup complete!"

# Development server
dev:
	@echo "🚀 Starting development server..."
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
prod:
	@echo "🚀 Starting production server..."
	uvicorn main:app --host 0.0.0.0 --port 8000
