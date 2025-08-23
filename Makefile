# Makefile pour TripShare/Trivenile
# Cibles DX (Developer Experience)

.PHONY: help dev test lint clean build docker-up docker-down install-frontend install-backend

# Variables
FRONTEND_DIR = TripShare
BACKEND_DIR = tripshare-backend
DOCKER_COMPOSE = docker-compose.yml

# Couleurs pour l'affichage
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Afficher cette aide
	@echo "$(GREEN)Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# Installation et setup
install: install-frontend install-backend ## Installer toutes les dépendances

install-frontend: ## Installer les dépendances frontend
	@echo "$(GREEN)Installation des dépendances frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm install

install-backend: ## Installer les dépendances backend
	@echo "$(GREEN)Installation des dépendances backend...$(NC)"
	cd $(BACKEND_DIR) && go mod tidy

# Développement
dev: docker-up ## Démarrer l'environnement de développement complet
	@echo "$(GREEN)Environnement de développement démarré$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:19006$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8085$(NC)"
	@echo "$(YELLOW)MinIO Console: http://localhost:9001$(NC)"

dev-frontend: ## Démarrer le frontend en mode développement
	@echo "$(GREEN)Démarrage du frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm start

dev-backend: ## Démarrer le backend en mode développement
	@echo "$(GREEN)Démarrage du backend...$(NC)"
	cd $(BACKEND_DIR) && go run ./cmd/api

# Tests
test: test-frontend test-backend ## Lancer tous les tests

test-frontend: ## Lancer les tests frontend
	@echo "$(GREEN)Lancement des tests frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm test

test-backend: ## Lancer les tests backend
	@echo "$(GREEN)Lancement des tests backend...$(NC)"
	cd $(BACKEND_DIR) && go test ./...

test-watch: ## Lancer les tests en mode watch (frontend)
	@echo "$(GREEN)Lancement des tests en mode watch...$(NC)"
	cd $(FRONTEND_DIR) && npm run test:watch

# Linting et formatage
lint: lint-frontend lint-backend ## Lancer tous les linters

lint-frontend: ## Linter le code frontend
	@echo "$(GREEN)Linting du code frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run lint

lint-backend: ## Linter le code backend
	@echo "$(GREEN)Linting du code backend...$(NC)"
	cd $(BACKEND_DIR) && golangci-lint run ./...

format: format-frontend format-backend ## Formater tout le code

format-frontend: ## Formater le code frontend
	@echo "$(GREEN)Formatage du code frontend...$(NC)"
	cd $(FRONTEND_DIR) && npx prettier --write .

format-backend: ## Formater le code backend
	@echo "$(GREEN)Formatage du code backend...$(NC)"
	cd $(BACKEND_DIR) && go fmt ./...

# Build
build: build-frontend build-backend ## Build complet

build-frontend: ## Build du frontend
	@echo "$(GREEN)Build du frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run build:android

build-backend: ## Build du backend
	@echo "$(GREEN)Build du backend...$(NC)"
	cd $(BACKEND_DIR) && go build -o bin/api ./cmd/api

# Docker
docker-up: ## Démarrer les services Docker
	@echo "$(GREEN)Démarrage des services Docker...$(NC)"
	docker-compose up -d postgres redis minio

docker-down: ## Arrêter les services Docker
	@echo "$(GREEN)Arrêt des services Docker...$(NC)"
	docker-compose down

docker-logs: ## Afficher les logs Docker
	docker-compose logs -f

docker-clean: ## Nettoyer les conteneurs et volumes Docker
	@echo "$(RED)Nettoyage des conteneurs et volumes Docker...$(NC)"
	docker-compose down -v
	docker system prune -f

# Base de données
db-migrate: ## Lancer les migrations de base de données
	@echo "$(GREEN)Lancement des migrations...$(NC)"
	cd $(BACKEND_DIR) && go run ./cmd/api migrate

db-reset: ## Réinitialiser la base de données
	@echo "$(RED)Réinitialisation de la base de données...$(NC)"
	docker-compose down -v
	docker-compose up -d postgres
	sleep 5
	cd $(BACKEND_DIR) && go run ./cmd/api migrate

# Nettoyage
clean: clean-frontend clean-backend ## Nettoyer tous les builds et caches

clean-frontend: ## Nettoyer le frontend
	@echo "$(GREEN)Nettoyage du frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run clean-all

clean-backend: ## Nettoyer le backend
	@echo "$(GREEN)Nettoyage du backend...$(NC)"
	cd $(BACKEND_DIR) && go clean -cache -modcache -testcache

# Sécurité
security-scan: ## Scanner les vulnérabilités
	@echo "$(GREEN)Scan de sécurité...$(NC)"
	cd $(FRONTEND_DIR) && npm audit
	cd $(BACKEND_DIR) && govulncheck ./...

# Type checking
type-check: ## Vérifier les types TypeScript
	@echo "$(GREEN)Vérification des types...$(NC)"
	cd $(FRONTEND_DIR) && npm run type-check

# Dépendances
deps-check: ## Vérifier les dépendances
	@echo "$(GREEN)Vérification des dépendances...$(NC)"
	cd $(FRONTEND_DIR) && npm outdated
	cd $(BACKEND_DIR) && go list -u -m all

deps-update: ## Mettre à jour les dépendances
	@echo "$(GREEN)Mise à jour des dépendances...$(NC)"
	cd $(FRONTEND_DIR) && npm update
	cd $(BACKEND_DIR) && go get -u ./...

# Utilitaires
status: ## Afficher le statut des services
	@echo "$(GREEN)Statut des services:$(NC)"
	docker-compose ps

logs: ## Afficher les logs en temps réel
	docker-compose logs -f

# Commandes de développement rapide
quick-start: install docker-up dev-backend ## Démarrage rapide (install + docker + backend)
	@echo "$(GREEN)Environnement prêt!$(NC)"

quick-test: lint test ## Test rapide (lint + tests)
	@echo "$(GREEN)Tous les tests passent!$(NC)"

# Commandes de production
prod-build: ## Build de production
	@echo "$(GREEN)Build de production...$(NC)"
	cd $(FRONTEND_DIR) && npm run build:android && npm run build:ios
	cd $(BACKEND_DIR) && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

prod-deploy: ## Déploiement de production (placeholder)
	@echo "$(RED)Déploiement de production - À implémenter$(NC)"

# Aide contextuelle
help-dev: ## Aide pour le développement
	@echo "$(GREEN)Commandes de développement:$(NC)"
	@echo "  make dev          - Démarrer l'environnement complet"
	@echo "  make dev-frontend - Démarrer seulement le frontend"
	@echo "  make dev-backend  - Démarrer seulement le backend"
	@echo "  make test         - Lancer tous les tests"
	@echo "  make lint         - Lancer tous les linters"

help-docker: ## Aide pour Docker
	@echo "$(GREEN)Commandes Docker:$(NC)"
	@echo "  make docker-up    - Démarrer les services"
	@echo "  make docker-down  - Arrêter les services"
	@echo "  make docker-logs  - Voir les logs"
	@echo "  make docker-clean - Nettoyer tout"

help-db: ## Aide pour la base de données
	@echo "$(GREEN)Commandes base de données:$(NC)"
	@echo "  make db-migrate   - Lancer les migrations"
	@echo "  make db-reset     - Réinitialiser la DB"
