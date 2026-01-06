# dockerService.py
# Hardened Docker execution for multiple languages (Java-safe)

import subprocess
import tempfile
import os
import shutil
import threading
from typing import List, Dict

# -----------------------------
# Constants
# -----------------------------

MAX_OUTPUT_CHARS = 10_000
OUTPUT_TRUNCATION_MESSAGE = "\n\n--- Output truncated (limit reached) ---"

DEFAULT_TIMEOUT = 10  # seconds (Java-safe)
DEFAULT_MEMORY = "256m"
DEFAULT_CPUS = "1.0"
DEFAULT_PIDS = "256"

# -----------------------------
# Image Configuration
# -----------------------------

LANGUAGE_IMAGES: Dict[str, Dict[str, str]] = {
    "python": {
        "image": "codeexec-python:latest",
        "dockerfile": "docker/python"
    },
    "java": {
        "image": "codeexec-java:latest",
        "dockerfile": "docker/java"
    },
    "javascript": {
        "image": "codeexec-node:latest",
        "dockerfile": "docker/node"
    },
    "go": {
        "image": "codeexec-go:latest",
        "dockerfile": "docker/go"
    },
    "cpp": {
        "image": "codeexec-cpp:latest",
        "dockerfile": "docker/cpp"
    }
}

# -----------------------------
# Thread-safe Image Locks
# -----------------------------

_IMAGE_LOCKS = {}
_GLOBAL_LOCK = threading.Lock()

# -----------------------------
# Docker Image Helpers
# -----------------------------

def _image_exists(image: str) -> bool:
    result = subprocess.run(
        ["docker", "image", "inspect", image],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    return result.returncode == 0


def _build_image(image: str, dockerfile_dir: str):
    subprocess.check_call([
        "docker", "build",
        "-t", image,
        dockerfile_dir
    ])


def ensure_image(image: str, dockerfile_dir: str):
    """
    Ensure Docker image exists (thread-safe).
    Builds the image if missing.
    """

    with _GLOBAL_LOCK:
        if image not in _IMAGE_LOCKS:
            _IMAGE_LOCKS[image] = threading.Lock()

    with _IMAGE_LOCKS[image]:
        if _image_exists(image):
            return

        print(f"[Docker] Image '{image}' not found. Building...")
        _build_image(image, dockerfile_dir)
        print(f"[Docker] Image '{image}' ready.")


# -----------------------------
# Docker Service
# -----------------------------

class DockerService:
    def __init__(self):
        # Default timeout (Python / JS)
        self.timeout_seconds = 5

    def _truncate(self, text: str) -> str:
        if not text:
            return ""
        if len(text) <= MAX_OUTPUT_CHARS:
            return text
        return text[:MAX_OUTPUT_CHARS] + OUTPUT_TRUNCATION_MESSAGE

    def run(self, image: str, filename: str, command: list[str], code: str):
        temp_dir = tempfile.mkdtemp()

        try:
            file_path = os.path.join(temp_dir, filename)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            docker_cmd = [
                "docker", "run", "--rm",

                # Security
                "--network=none",
                "--read-only",

                # REQUIRED for Java (and future Go/Rust/C++)
                "--tmpfs", "/tmp:rw,exec,size=128m",

                # Resources
                "--memory=256m",        # Java needs more memory
                "--cpus=1.0",
                "--pids-limit=256",     # JVM needs threads

                "--security-opt=no-new-privileges",

                "-v", f"{temp_dir}:/app:rw",
                image,
                *command
            ]

            result = subprocess.run(
                docker_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=10  # Java-safe timeout
            )

            return {
                "stdout": self._truncate(result.stdout),
                "stderr": self._truncate(result.stderr),
                "exit_code": result.returncode
            }

        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out (possible infinite loop or heavy JVM startup)",
                "exit_code": -1
            }

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
