#!/bin/sh

PORT=${PORT:-8080}
echo "Using PORT: $PORT"

# Configure php-fpm to use Unix socket
cat > /usr/local/etc/php-fpm.d/www.conf << 'FPM'
[www]
user = nobody
group = nobody
listen = /tmp/php-fpm.sock
listen.owner = nobody
listen.group = nobody
listen.mode = 0666
pm = dynamic
pm.max_children = 5
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
FPM

# Write nginx config — listen on 0.0.0.0 so Railway can reach it
cat > /etc/nginx/http.d/default.conf << NGINX
server {
    listen 0.0.0.0:${PORT};
    root /var/www/html;
    index login.php index.php;

    location / {
        try_files \$uri \$uri/ /login.php?\$query_string;
    }

    location ~ \.php\$ {
        fastcgi_pass unix:/tmp/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)\$ {
        expires max;
        log_not_found off;
    }
}
NGINX

# Remove default nginx config that might conflict
rm -f /etc/nginx/http.d/default.conf.bak
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null

echo "Starting php-fpm..."
php-fpm -F &
FPM_PID=$!
sleep 3

# Verify php-fpm socket exists
if [ -S /tmp/php-fpm.sock ]; then
    echo "php-fpm socket ready"
else
    echo "ERROR: php-fpm socket not found!"
fi

echo "Starting nginx on 0.0.0.0:${PORT}..."
exec nginx -g "daemon off;"
