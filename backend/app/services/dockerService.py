# dockerService.py
# Hardened Docker execution for multiple languages (Java-safe)

import subprocess
import tempfile
import os
import shutil

MAX_OUTPUT_CHARS = 10_000
OUTPUT_TRUNCATION_MESSAGE = "\n\n--- Output truncated (limit reached) ---"


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
