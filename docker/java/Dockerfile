# Lightweight OpenJDK image
FROM eclipse-temurin:21-jdk-jammy

# Create non-root user
RUN useradd -m runner

# Working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Default command (overridden)
CMD ["java", "Main"]
