# Build Node.js backend using monorepo workspace configuration
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies using root monorepo lockfile
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --omit=dev --workspace=server

# Copy server code
COPY server/ ./server/

# Run as non-root user for security (Industry SOP)
RUN chown -R node:node /app
USER node

EXPOSE 5555

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5555) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "server/server.js"]
