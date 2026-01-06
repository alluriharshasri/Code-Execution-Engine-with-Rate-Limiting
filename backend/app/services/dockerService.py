# dockerService.py
# Hardened Docker execution for multiple languages with auto image build

import subprocess
import tempfile
import os
import shutil
import threading
from typing import Dict, List

# =====================================================
# PROJECT ROOT (ABSOLUTE PATH)
# =====================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../")
)

# =====================================================
# CONSTANTS
# =====================================================

MAX_OUTPUT_CHARS = 10_000
OUTPUT_TRUNCATION_MESSAGE = "\n\n--- Output truncated (limit reached) ---"

DEFAULT_TIMEOUT = 10
DEFAULT_MEMORY = "256m"
DEFAULT_CPUS = "1.0"
DEFAULT_PIDS = "256"

# =====================================================
# LANGUAGE → IMAGE CONFIG
# =====================================================

LANGUAGE_IMAGES: Dict[str, Dict[str, str]] = {
    "python": {
        "image": "codeexec-python:latest",
        "dockerfile": os.path.join(BASE_DIR, "docker/python")
    },
    "java": {
        "image": "codeexec-java:latest",
        "dockerfile": os.path.join(BASE_DIR, "docker/java")
    },
    "javascript": {
        "image": "codeexec-node:latest",
        "dockerfile": os.path.join(BASE_DIR, "docker/node")
    },
    "go": {
        "image": "codeexec-go:latest",
        "dockerfile": os.path.join(BASE_DIR, "docker/go")
    },
    "cpp": {
        "image": "codeexec-cpp:latest",
        "dockerfile": os.path.join(BASE_DIR, "docker/cpp")
    }
}

# =====================================================
# THREAD-SAFE IMAGE LOCKS
# =====================================================

_IMAGE_LOCKS: Dict[str, threading.Lock] = {}
_GLOBAL_LOCK = threading.Lock()

# =====================================================
# DOCKER IMAGE HELPERS
# =====================================================

def _image_exists(image: str) -> bool:
    return subprocess.run(
        ["docker", "image", "inspect", image],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ).returncode == 0


def _build_image(image: str, dockerfile_dir: str):
    subprocess.check_call([
        "docker", "build",
        "-t", image,
        dockerfile_dir
    ])


def ensure_image(language: str):
    """
    Ensure Docker image exists for the given language.
    Builds it if missing (thread-safe).
    """
    cfg = LANGUAGE_IMAGES[language]
    image = cfg["image"]
    dockerfile_dir = cfg["dockerfile"]

    with _GLOBAL_LOCK:
        if image not in _IMAGE_LOCKS:
            _IMAGE_LOCKS[image] = threading.Lock()

    with _IMAGE_LOCKS[image]:
        if _image_exists(image):
            return

        print(f"[Docker] Image '{image}' not found. Building...")
        _build_image(image, dockerfile_dir)
        print(f"[Docker] Image '{image}' ready.")

# =====================================================
# DOCKER SERVICE
# =====================================================

class DockerService:
    def __init__(self):
        self.timeout_seconds = DEFAULT_TIMEOUT

    def _truncate(self, text: str) -> str:
        if not text:
            return ""
        if len(text) <= MAX_OUTPUT_CHARS:
            return text
        return text[:MAX_OUTPUT_CHARS] + OUTPUT_TRUNCATION_MESSAGE

    def run(
        self,
        language: str,
        filename: str,
        command: List[str],
        code: str
    ):
        if language not in LANGUAGE_IMAGES:
            return {
                "stdout": "",
                "stderr": f"Unsupported language: {language}",
                "exit_code": -1
            }

        # 🔥 ENSURE IMAGE EXISTS (BUILD IF NEEDED)
        ensure_image(language)

        temp_dir = tempfile.mkdtemp(prefix="codeexec_")

        try:
            file_path = os.path.join(temp_dir, filename)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            image = LANGUAGE_IMAGES[language]["image"]

            docker_cmd = [
                "docker", "run", "--rm",

                # Security
                "--network=none",
                "--read-only",
                "--security-opt=no-new-privileges",

                # Runtime temp (Java / Go / C++)
                "--tmpfs", "/tmp:rw,exec,size=128m",

                # Resource limits
                f"--memory={DEFAULT_MEMORY}",
                f"--cpus={DEFAULT_CPUS}",
                f"--pids-limit={DEFAULT_PIDS}",

                # Code mount
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
                timeout=self.timeout_seconds
            )

            return {
                "stdout": self._truncate(result.stdout),
                "stderr": self._truncate(result.stderr),
                "exit_code": result.returncode
            }

        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out (possible infinite loop or heavy compilation)",
                "exit_code": -1
            }

        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"Execution failed: {str(e)}",
                "exit_code": -1
            }

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
