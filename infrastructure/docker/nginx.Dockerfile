FROM nginx:alpine

# Copy our nginx configuration
COPY infrastructure/nginx/nginx.conf /etc/nginx/nginx.conf

# Install curl for health checks
RUN apk add --no-cache curl

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 