# Makefile

# Environment variables
PROJECT_ROOT := $(PWD)
ATLAS_DIR := $(PROJECT_ROOT)/atlas
DIST_DIR := $(PROJECT_ROOT)/dist
SERVER_DIR := $(PROJECT_ROOT)/server
WEB_DIR := $(PROJECT_ROOT)/web

.PHONY: build clean build-server build-web tsc install postinstall build-atlas

build: clean build-atlas build-server build-web

clean:
	@echo "Cleaning dist directory..."
	@if [ -d $(DIST_DIR) ]; then rm -rf $(DIST_DIR); fi

build-atlas:
	@echo "Bulding atlas..."
	@rm -rf $(SERVER_DIR)/src/atlas
	@rm -rf $(WEB_DIR)/src/atlas
	@cp -R $(ATLAS_DIR) $(SERVER_DIR)/src
	@cp -R $(ATLAS_DIR) $(WEB_DIR)/src

build-server:
	@echo "Building SERVER..."
	@cp -R $(SERVER_DIR) $(DIST_DIR)
	@cd $(DIST_DIR) && npm run build
	@rm -rf $(DIST_DIR)/src
	@mv $(DIST_DIR)/dist/* $(DIST_DIR)/
	@rmdir $(DIST_DIR)/dist

build-web:
	@echo "Building Web frontend..."
	@cd $(WEB_DIR) && npm run build
	@cp -R $(WEB_DIR)/build/frontend $(DIST_DIR)/static

tsc:
	@echo "Running TypeScript compilation..."
	@cd $(SERVER_DIR) && npm run tsc
	@cd $(WEB_DIR) && npm run tsc

install:
	@echo "Installing dependencies for main module and submodules"
	yarn install

postinstall:
	@echo "Running postinstall: installing dependencies in server and web..."
	@cd $(SERVER_DIR) && yarn install
	@cd $(WEB_DIR) && yarn install
