from core.languages import SUPPORTED_LANGUAGES
from services.dockerService import DockerService


class ExecutionService:
    def __init__(self):
        self.docker = DockerService()

    def execute(self, language: str, code: str):
        config = SUPPORTED_LANGUAGES.get(language)

        if not config:
            return {
                "stdout": "",
                "stderr": f"Execution for '{language}' is not supported",
                "exit_code": -1
            }

        return self.docker.run(
            language=language,          
            filename=config["file"],
            command=config["command"],
            code=code
        )
