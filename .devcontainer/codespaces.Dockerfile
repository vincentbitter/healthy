ARG PHP_VERSION=7.4
FROM mcr.microsoft.com/devcontainers/php:${PHP_VERSION}

# Dependencies
RUN apt-get update && apt-get install -y \
    openssh-client \
    curl \
    ca-certificates \
    unzip

RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y git

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Wordpress
ARG WP_VERSION=6.0
RUN curl -o wordpress.tar.gz https://wordpress.org/wordpress-${WP_VERSION}.tar.gz \
    && tar -xzf wordpress.tar.gz --strip-components=1 -C /var/www/html \
    && rm wordpress.tar.gz

# WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

# SQLite
RUN curl -L -o /tmp/sqlite.zip https://downloads.wordpress.org/plugin/sqlite-database-integration.latest-stable.zip \
    && unzip /tmp/sqlite.zip -d /var/www/html/wp-content/plugins \
    && rm /tmp/sqlite.zip \
    && cp /var/www/html/wp-content/plugins/sqlite-database-integration/db.copy \
    /var/www/html/wp-content/db.php

RUN mkdir -p /var/www/html/wp-content/database

# Wordpress config
RUN wp config create \
    --dbname=wp \
    --dbuser=wp \
    --dbpass=wp \
    --dbhost=localhost \
    --path=/var/www/html \
    --allow-root \
    --skip-check

RUN sed -i '/\/\* Add any custom values between this line and the "stop editing" line\. \*\//a \
    \
    if (!empty($_SERVER["HTTP_X_FORWARDED_HOST"])) { \
    $_SERVER["HTTP_HOST"] = $_SERVER["HTTP_X_FORWARDED_HOST"]; \
    } \
    \
    if (!empty($_SERVER["HTTP_X_FORWARDED_PROTO"]) && $_SERVER["HTTP_X_FORWARDED_PROTO"] === "https") { \
    $_SERVER["HTTPS"] = "on"; \
    $_SERVER["SERVER_PORT"] = $_SERVER["HTTP_X_FORWARDED_PORT"] ?? 443; \
    $_SERVER["REQUEST_SCHEME"] = "https"; \
    } \
    ' /var/www/html/wp-config.php


# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/wp-content
