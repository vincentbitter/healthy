ARG PHP_VERSION=8.5
FROM mcr.microsoft.com/devcontainers/php:${PHP_VERSION}

# Dependencies
RUN docker-php-ext-install mysqli

RUN apt-get update && apt-get install -y \
    openssh-client \
    curl \
    ca-certificates \
    unzip \
    default-mysql-client

RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y git

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Disable Xdebug logs for CLI
RUN echo "xdebug.log_level=0" >> /usr/local/etc/php/conf.d/xdebug.ini

# Wordpress
ARG WP_VERSION=6.0
RUN curl -o wordpress.tar.gz https://wordpress.org/wordpress-${WP_VERSION}.tar.gz \
    && tar -xzf wordpress.tar.gz --strip-components=1 -C /var/www/html \
    && rm wordpress.tar.gz

# WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

# Wordpress config
ARG WORDPRESS_DB_NAME=wp
ARG WORDPRESS_DB_USER=wp
ARG WORDPRESS_DB_PASSWORD=wp
ARG WORDPRESS_DB_HOST=db

RUN wp config create \
    --dbname=${WORDPRESS_DB_NAME} \
    --dbuser=${WORDPRESS_DB_USER} \
    --dbpass=${WORDPRESS_DB_PASSWORD} \
    --dbhost=${WORDPRESS_DB_HOST} \
    --path=/var/www/html \
    --allow-root \
    --skip-check

# Fix $_SERVER variables for Codespaces
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