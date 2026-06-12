FROM php:8.2-apache

# Install PDO + PDO_MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite for clean URLs
RUN a2enmod rewrite

# Set document root
WORKDIR /var/www/html
