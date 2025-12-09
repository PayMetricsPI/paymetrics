FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=1305
ENV MYSQL_DATABASE=paymetrics

COPY database.sql /docker-entrypoint-initdb.d/

EXPOSE 3306