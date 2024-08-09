FROM busybox as development
WORKDIR /app
CMD httpd -f -p 8000 -h /app

FROM busybox as production
WORKDIR /app
COPY src/* .
CMD httpd -f -p 8000 -h /app
