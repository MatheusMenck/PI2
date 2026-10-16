FROM php:8.5.5-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libpq-dev zip git unzip && \
    docker-php-ext-install pdo_pgsql pgsql pdo_mysql gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .
RUN composer install

CMD ["php-fpm"]