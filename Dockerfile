FROM node:22-slim

WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript project
RUN npm run build

# Remove devDependencies for the runtime image
RUN npm prune --omit=dev
ENV NODE_ENV=production

# Expose the MCP HTTP port expected by Smithery (defaults to 8081)
EXPOSE 8081

# Run the Streamable HTTP server entrypoint
CMD ["node", "dist/httpServer.js"]

