# languages.py
# Central registry of supported languages and execution config

SUPPORTED_LANGUAGES = {
    "python": {
        "name": "Python",
        "image": "codeexec-python",
        "file": "main.py",
        "command": ["python", "/app/main.py"],
    },

    "javascript": {
        "name": "JavaScript",
        "image": "codeexec-node",
        "file": "main.js",
        "command": ["node", "/app/main.js"],
    },

    "java": {
        "name": "Java",
        "image": "codeexec-java",
        "file": "Main.java",
        "command": [
            "sh", "-c",
            "javac /app/Main.java && java -cp /app Main"
        ],
    },
}
