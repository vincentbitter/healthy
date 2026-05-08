ARG PHP_VERSION=7.4
FROM php:${PHP_VERSION}-apache

# Fix port
RUN sed -i 's/80/8080/g' /etc/apache2/ports.conf \
    && sed -i 's/:80/:8080/g' /etc/apache2/sites-enabled/000-default.conf

EXPOSE 8080

# Dependencies
RUN apt-get update && apt-get install -y unzip

RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y git


RUN apt-get update && apt-get install -y \
    openssh-client \
    curl \
    ca-certificates

# Xdebug
RUN if [ "$(php -r 'echo PHP_MAJOR_VERSION;')" -lt "8" ]; then \
    pecl install xdebug-3.1.6 && docker-php-ext-enable xdebug; \
    elif [ "$(php -r 'echo PHP_MAJOR_VERSION;')" = "8" ] && [ "$(php -r 'echo PHP_MINOR_VERSION;')" -lt "3" ]; then \
    pecl install xdebug-3.2.2 && docker-php-ext-enable xdebug; \
    else \
    pecl install xdebug && docker-php-ext-enable xdebug; \
    fi

COPY xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

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

RUN mkdir -p /var/www/html/wp-content/database \
    && chown -R www-data:www-data /var/www/html/wp-content

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
if (isset($_SERVER["HTTP_X_FORWARDED_PROTO"]) && $_SERVER["HTTP_X_FORWARDED_PROTO"] === "https") { \
    $_SERVER["HTTPS"] = "on"; \
}' /var/www/html/wp-config.php
