# dockerService.py
# Hardened Docker execution for multiple languages

import subprocess
import tempfile
import os
import shutil
import platform
import time

MAX_OUTPUT_CHARS = 10_000
OUTPUT_TRUNCATION_MESSAGE = "\n\n--- Output truncated (limit reached) ---"


class DockerService:
    def __init__(self):
        self.timeout_seconds = 5

    def _truncate(self, text: str) -> str:
        if len(text) <= MAX_OUTPUT_CHARS:
            return text
        return text[:MAX_OUTPUT_CHARS] + OUTPUT_TRUNCATION_MESSAGE

    def _is_docker_running(self) -> bool:
        """Check if Docker daemon is running"""
        try:
            result = subprocess.run(
                ["docker", "info"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def _start_docker(self) -> bool:
        """Attempt to start Docker daemon"""
        try:
            system = platform.system()
            
            if system == "Windows":
                # Try to start Docker Desktop on Windows
                try:
                    subprocess.Popen(
                        r"C:\Program Files\Docker\Docker\Docker.exe",
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                except FileNotFoundError:
                    # Try alternate path
                    try:
                        subprocess.Popen(
                            "docker",
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL
                        )
                    except FileNotFoundError:
                        return False
                
                # Wait for Docker to start
                for _ in range(30):  # 30 second timeout
                    time.sleep(1)
                    if self._is_docker_running():
                        return True
                return False
            
            elif system == "Darwin":  # macOS
                try:
                    subprocess.Popen(
                        ["open", "-a", "Docker"],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                except FileNotFoundError:
                    return False
                
                # Wait for Docker to start
                for _ in range(30):
                    time.sleep(1)
                    if self._is_docker_running():
                        return True
                return False
            
            elif system == "Linux":
                # Try to start Docker service
                try:
                    subprocess.run(
                        ["sudo", "systemctl", "start", "docker"],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        timeout=10
                    )
                    time.sleep(2)
                    return self._is_docker_running()
                except (FileNotFoundError, subprocess.TimeoutExpired):
                    return False
            
            return False
        except Exception:
            return False

    def _image_exists(self, image: str) -> bool:
        """Check if Docker image exists locally"""
        try:
            result = subprocess.run(
                ["docker", "image", "inspect", image],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def _pull_image(self, image: str) -> tuple[bool, str]:
        """Pull Docker image if not present. Returns (success, message)"""
        try:
            result = subprocess.run(
                ["docker", "pull", image],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=300  # 5 minute timeout for pulling
            )
            if result.returncode == 0:
                return True, f"Image '{image}' pulled successfully"
            else:
                return False, f"Failed to pull image '{image}': {result.stderr}"
        except subprocess.TimeoutExpired:
            return False, f"Pulling image '{image}' timed out"
        except FileNotFoundError:
            return False, "Docker is not installed or not in PATH"

    def _ensure_docker_ready(self) -> tuple[bool, str]:
        """Ensure Docker is ready to use. Returns (success, message)"""
        if self._is_docker_running():
            return True, "Docker is running"
        
        # Docker is not running, attempt to start it
        if self._start_docker():
            return True, "Docker was started successfully"
        
        return False, "Docker is not running and could not be started. Please start Docker manually."

    def run(self, image: str, filename: str, command: list[str], code: str):
        # Ensure Docker is ready
        docker_ready, docker_msg = self._ensure_docker_ready()
        if not docker_ready:
            return {
                "stdout": "",
                "stderr": docker_msg,
                "exit_code": -1
            }
        
        # Check if image exists, pull if necessary
        if not self._image_exists(image):
            pull_success, pull_msg = self._pull_image(image)
            if not pull_success:
                return {
                    "stdout": "",
                    "stderr": pull_msg,
                    "exit_code": -1
                }
        
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
