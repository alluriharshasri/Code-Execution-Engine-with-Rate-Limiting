# Minimal image with gcc & g++
FROM gcc:13-bookworm

# Create non-root user
RUN useradd -m runner

WORKDIR /app
USER runner

# Default command (overridden)
CMD ["bash"]
