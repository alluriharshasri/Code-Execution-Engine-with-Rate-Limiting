# Lightweight Node.js image
FROM node:20-slim

# Create non-root user (security)
RUN useradd -m runner

# Working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Default command (overridden by docker run)
CMD ["node", "main.js"]
