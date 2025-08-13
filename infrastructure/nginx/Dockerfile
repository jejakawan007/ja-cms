# Nginx Dockerfile untuk JA-CMS
# Infrastructure configuration

FROM nginx:alpine

# Install required packages
RUN apk add --no-cache \
    openssl \
    certbot \
    certbot-nginx

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy nginx configuration
COPY conf/default.conf /etc/nginx/conf.d/default.conf

# Create self-signed certificate for development
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=JA-CMS/OU=IT/CN=localhost"

# Create nginx user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set proper permissions
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /etc/nginx/ssl

# Switch to non-root user
USER nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 