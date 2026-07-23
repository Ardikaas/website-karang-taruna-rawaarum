# Stage 1: Build React static bundle using monorepo workspaces
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace config and lockfile
COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies including devDependencies (since we need Vite to build)
RUN npm ci --workspace=client

# Copy client code
COPY client/ ./client/

# Build client React application
ENV VITE_API_URL=/api
RUN npm run build --workspace=client

# Stage 2: Serve static files with Nginx (Industry SOP)
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
