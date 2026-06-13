FROM php:8.2-fpm-alpine

# Install PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Install nginx
RUN apk add --no-cache nginx

# Create nginx runtime dir
RUN mkdir -p /run/nginx

# Copy all project files
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Copy and enable startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Railway sets $PORT dynamically — start.sh reads it
CMD ["/start.sh"]
