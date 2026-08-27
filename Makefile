# =============================================================================
# BidCompliance AI Platform - Makefile
# =============================================================================

.PHONY: help dev dev-python dev-node install install-python install-node test test-python test-node lint lint-python lint-node migrate migrate-up migrate-down db-reset seed clean build docker-up docker-down docker-logs

# Default target
help:
	@echo "BidCompliance AI Platform - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev           - Start both Python and Node backends (requires .env)"
	@echo "  make dev-python    - Start only Python backend (port 8000)"
	@echo "  make dev-node      - Start only Node backend (port 3000)"
	@echo ""
	@echo "Installation:"
	@echo "  make install       - Install all dependencies"
	@echo "  make install-python - Install Python dependencies"
	@echo "  make install-node  - Install Node dependencies"
	@echo ""
	@echo "Testing:"
	@echo "  make test          - Run all tests"
	@echo "  make test-python   - Run Python tests (pytest)"
	@echo "  make test-node     - Run Node tests (jest)"
	@echo ""
	@echo "Linting:"
	@echo "  make lint          - Run all linters"
	@echo "  make lint-python   - Run Python linters (ruff, mypy)"
	@echo "  make lint-node     - Run Node linters (eslint)"
	@echo ""
	@echo "Database:"
	@echo "  make migrate       - Run database migrations (alembic)"
	@echo "  make migrate-up    - Apply all pending migrations"
	@echo "  make migrate-down  - Rollback last migration"
	@echo "  make db-reset      - Drop and recreate database (DANGEROUS)"
	@echo "  make seed          - Seed database with demo data"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up     - Start all services via docker-compose"
	@echo "  make docker-down   - Stop all services"
	@echo "  make docker-logs   - View docker logs"
	@echo ""
	@echo "Build:"
	@echo "  make build         - Build production Docker images"
	@echo "  make clean         - Clean build artifacts"

# =============================================================================
# Development
# =============================================================================

dev:
	@echo "Starting both backends..."
	@echo "Python API: http://localhost:8000"
	@echo "Node API:   http://localhost:3000"
	@echo "Frontend:   http://localhost:3000"
	@echo ""
	@echo "Press Ctrl+C to stop both"
	@trap 'kill %1 %2' INT; \
	make dev-python & \
	make dev-node & \
	wait

dev-python:
	@cd backend && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-node:
	@cd app && npm run dev

# =============================================================================
# Installation
# =============================================================================

install: install-python install-node

install-python:
	@echo "Installing Python dependencies..."
	@cd backend && \
	if [ ! -d ".venv" ]; then python -m venv .venv; fi && \
	.venv/bin/pip install --upgrade pip && \
	.venv/bin/pip install -r requirements.txt

install-node:
	@echo "Installing Node dependencies..."
	@cd app && npm install

# =============================================================================
# Testing
# =============================================================================

test: test-python test-node

test-python:
	@cd backend && .venv/bin/pytest tests/ -v --cov=app --cov-report=term-missing

test-node:
	@cd app && npm test

# =============================================================================
# Linting
# =============================================================================

lint: lint-python lint-node

lint-python:
	@cd backend && .venv/bin/ruff check app/ && .venv/bin/mypy app/

lint-node:
	@cd app && npm run lint

# =============================================================================
# Database Migrations (Alembic)
# =============================================================================

migrate: migrate-up

migrate-up:
	@cd backend && .venv/bin/alembic upgrade head

migrate-down:
	@cd backend && .venv/bin/alembic downgrade -1

migrate-create:
	@cd backend && .venv/bin/alembic revision --autogenerate -m "$(MSG)"

migrate-history:
	@cd backend && .venv/bin/alembic history

db-reset:
	@echo "WARNING: This will drop all tables!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	@cd backend && .venv/bin/alembic downgrade base && .venv/bin/alembic upgrade head

# =============================================================================
# Seeding
# =============================================================================

seed:
	@cd backend && .venv/bin/python scripts/seed_demo.py

# =============================================================================
# Docker
# =============================================================================

docker-up:
	@docker-compose up -d --build

docker-down:
	@docker-compose down -v

docker-logs:
	@docker-compose logs -f

docker-ps:
	@docker-compose ps

# =============================================================================
# Build
# =============================================================================

build:
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# =============================================================================
# Clean
# =============================================================================

clean:
	@echo "Cleaning build artifacts..."
	@cd backend && rm -rf .venv __pycache__ .pytest_cache .mypy_cache .ruff_cache htmlcov .coverage
	@cd app && rm -rf node_modules dist build .next
	@rm -rf .docker