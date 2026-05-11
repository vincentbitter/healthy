#!/bin/bash
set -e
echo "=== Post-start ==="

# Composer install
echo "Running composer install..."
cd src
composer install
cd ..

# PNPM install and build
echo "Running pnpm install and build..."
pnpm install
pnpm build

# Enable Healthy plugin
echo "Enabling Healthy plugin..."
if [ "$(id -u)" -eq 0 ]; then
    wp plugin activate healthy --allow-root --path=/var/www/html
else
    sudo wp plugin activate healthy --allow-root --path=/var/www/html
fi