FROM gcc:13-bookworm

# Use adduser instead of useradd (more portable)
RUN adduser --disabled-password --gecos "" runner

WORKDIR /app
USER runner

CMD ["bash"]
