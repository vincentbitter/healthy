#!/bin/bash
set -e
echo "=== Post-start ==="

# Composer install
echo "Running composer install..."
cd src
composer install
cd ..

# Clear dist directory
echo "Clearing dist directory..."
sudo rm -rf dist/*

# PNPM install and build
echo "Running pnpm install and build..."
pnpm install
pnpm build

# Enable Healthy plugin
echo "Enabling Healthy plugin..."
sudo wp plugin activate healthy --allow-root --path=/var/www/html