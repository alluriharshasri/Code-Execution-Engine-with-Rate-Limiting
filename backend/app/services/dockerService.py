# dockerService.py
# Hardened Docker execution for multiple languages

import subprocess
import tempfile
import os
import shutil

MAX_OUTPUT_CHARS = 10_000
OUTPUT_TRUNCATION_MESSAGE = "\n\n--- Output truncated (limit reached) ---"


class DockerService:
    def __init__(self):
        self.timeout_seconds = 5

    def _truncate(self, text: str) -> str:
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
                "--network=none",
                "--read-only",
                "--memory=128m",
                "--cpus=0.5",
                "--pids-limit=64",
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
                "stderr": "Execution timed out (possible infinite loop)",
                "exit_code": -1
            }

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
