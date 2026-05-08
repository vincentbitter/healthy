ARG PHP_VERSION=7.4
FROM php:${PHP_VERSION}-apache

# Dependencies
RUN docker-php-ext-install mysqli

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

COPY .devcontainer/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

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