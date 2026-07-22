FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies cleanly
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code with unprivileged user ownership
COPY --chown=node:node . .

# Run as non-root user for Industry SOP container security
USER node

EXPOSE 5555

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5555) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "server.js"]
