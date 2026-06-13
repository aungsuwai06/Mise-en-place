FROM php:8.2-fpm-alpine

RUN docker-php-ext-install pdo pdo_mysql
RUN apk add --no-cache nginx
RUN mkdir -p /run/nginx /tmp

COPY . /var/www/html/
RUN chown -R nobody:nobody /var/www/html

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
