# languages.py
# Central registry of supported languages and execution config

SUPPORTED_LANGUAGES = {
    "python": {
        "name": "Python",
        "file": "main.py",
        "command": ["python", "/app/main.py"],
    },

    "javascript": {
        "name": "JavaScript",
        "file": "main.js",
        "command": ["node", "/app/main.js"],
    },

    "java": {
        "name": "Java",
        "file": "Main.java",
        "command": [
            "sh", "-c",
            "javac /app/Main.java && java -cp /app Main"
        ],
    },
}
