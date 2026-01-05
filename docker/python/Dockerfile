# Base Python image
FROM python:3.11-slim

# Create non-root user (SECURITY)
RUN useradd -m runner

# Set working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Default command (will be overridden)
CMD ["python", "main.py"]
