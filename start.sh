#!/bin/sh
set -e

PORT=${PORT:-80}

# Write nginx config at runtime with correct PORT
cat > /etc/nginx/http.d/default.conf << NGINX
server {
    listen ${PORT};
    root /var/www/html;
    index login.php index.php;

    location / {
        try_files \$uri \$uri/ /login.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        log_not_found off;
    }
}
NGINX

# Start php-fpm (try different binary names used by Alpine)
echo "Starting php-fpm..."
php-fpm8.2 -D 2>/dev/null || php-fpm82 -D 2>/dev/null || php-fpm -D
sleep 2

echo "Starting nginx on port ${PORT}..."
exec nginx -g "daemon off;"
