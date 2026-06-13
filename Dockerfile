FROM php:8.2-fpm-alpine

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Install nginx + bash (bash needed for reliable scripting)
RUN apk add --no-cache nginx bash

# Create required runtime directories
RUN mkdir -p /run/nginx /var/log/nginx

# Copy all project files to web root
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Copy and enable startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/bin/bash", "/start.sh"]
