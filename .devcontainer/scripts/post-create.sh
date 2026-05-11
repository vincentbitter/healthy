#!/bin/bash
set -e
echo "=== Post-create ==="

# Wait for MySQL to be ready
if [ ! -f /var/www/html/wp-content/db.php ]; then
  echo "Check database connection..."
  until wp db check --allow-root --path=/var/www/html; do
      echo "Waiting for database to be ready..."
      sleep 3
  done
fi

# Install WordPress
echo "Installing WordPress..."
if [ -n "$CODESPACE_NAME" ]; then
    SITE_URL="https://${CODESPACE_NAME}-8080.app.github.dev"
else
    SITE_URL="http://localhost:8080"
fi
wp core install --allow-root \
  --path=/var/www/html \
  --url="$SITE_URL" \
  --title="$SITE_NAME" \
  --admin_user=admin \
  --admin_password=admin \
  --admin_email=admin@example.com

# Ensure plugin-check
WP_VERSION=$(wp core version --allow-root --path=/var/www/html | tail -n 1)
if dpkg --compare-versions "$WP_VERSION" ge "6.3"; then
  echo "Installing plugin-check..."
  wp plugin install plugin-check --activate --allow-root --path=/var/www/html
else
    echo "Skipping plugin-check: WP version $WP_VERSION < 6.3"
fi

# Fix permissions
echo "Setting permissions..."
chown -R www-data:www-data /var/www/html

# Add Healthy plugin
echo "Linking Healthy plugin..."
ln -sfn "$(pwd)/dist" /var/www/html/wp-content/plugins/healthy
