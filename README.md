# 🚀 Code Execution Engine

A modern, secure online code execution platform with a beautiful UI. Execute code in multiple programming languages directly in your browser with Docker-based sandboxing and rate limiting.

![Code Execution Engine](https://img.shields.io/badge/Status-Active-success) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green) ![Docker](https://img.shields.io/badge/Docker-Required-blue)

## ✨ Features

- **🖥️ Monaco Editor** - VS Code-like editing experience with syntax highlighting
- **🐳 Docker Sandboxing** - Secure code execution in isolated containers
- **⚡ Rate Limiting** - Prevents abuse with configurable request limits
- **🎨 Dark/Light Themes** - Beautiful UI with theme toggle
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🔄 Resizable Panels** - Drag to resize editor and output panels
- **💾 Auto-save** - Code is automatically saved to local storage

## 🌐 Supported Languages

| Language | Version | Status |
|----------|---------|--------|
| Python | 3.11 | ✅ Ready |
| JavaScript | Node.js | ✅ Ready |
| Java | OpenJDK | ✅ Ready |
| C/C++ | GCC | NOT Ready |

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│  FastAPI API    │────▶│  Docker Engine  │
│  (Monaco Editor)│     │  (Backend)      │     │  (Sandboxed)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
Code-Execution-Engine-with-Rate-Limiting/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI application entry
│       ├── requirements.txt     # Python dependencies
│       ├── api/
│       │   └── routes/
│       │       ├── execute.py   # Code execution endpoint
│       │       └── health.py    # Health check endpoint
│       ├── core/
│       │   ├── config.py        # App configuration
│       │   └── languages.py     # Supported languages registry
│       └── services/
│           ├── dockerService.py    # Docker container management
│           └── executionService.py # Code execution logic
├── docker/
│   ├── python/Dockerfile        # Python runtime container
│   ├── javascript/Dockerfile    # Node.js runtime container
│   ├── java/Dockerfile          # Java runtime container
│   └── c-cpp/Dockerfile         # GCC runtime container
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   ├── global.css           # Global styles
│   │   ├── themes.css           # Dark/Light theme variables
│   │   └── editor.css           # Editor-specific styles
│   └── js/
│       ├── api.js               # API client
│       ├── editor.js            # Monaco Editor setup
│       ├── languageSelector.js  # Language switching
│       ├── outputBox.js         # Output display
│       ├── resizer.js           # Panel resizing
│       ├── runCode.js           # Code execution handler
│       └── themeToggle.js       # Theme switching
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Docker Desktop** (running)
- **Node.js** (optional, for frontend development)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/Code-Execution-Engine-with-Rate-Limiting.git
cd Code-Execution-Engine-with-Rate-Limiting
```

### 2️⃣ Set Up Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
cd backend/app
pip install -r requirements.txt
```

### 3️⃣ Build Docker Images

```bash
# Build all language runtime images
docker build -t code-runner-python ./docker/python
docker build -t code-runner-javascript ./docker/javascript
docker build -t code-runner-java ./docker/java
docker build -t code-runner-c-cpp ./docker/c-cpp
```

### 4️⃣ Start the Backend

```bash
cd backend/app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5️⃣ Open the Frontend

Open `frontend/index.html` in your browser, or serve it with a local server:

```bash
# Using Python
cd frontend
python -m http.server 3000

# Or using Node.js
npx serve frontend -p 3000
```

Visit: **http://localhost:3000**

## 🔧 API Reference

### Execute Code

```http
POST /execute
Content-Type: application/json

{
  "code": "print('Hello, World!')",
  "language": "python"
}
```

**Response:**
```json
{
  "status": "success",
  "output": "Hello, World!\n"
}
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

## 🔒 Security Features

- **Docker Isolation** - Each execution runs in a separate container
- **Non-root User** - Code runs as unprivileged user inside containers
- **Timeout Limits** - Execution timeout prevents infinite loops
- **Memory Limits** - Container memory is capped
- **Code Size Limit** - Maximum 10KB code size
- **Rate Limiting** - Prevents API abuse

## ⚙️ Configuration

Environment variables can be set in a `.env` file:

```env
# Execution limits
EXECUTION_TIMEOUT=10
MAX_CODE_SIZE=10240

# Rate limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

## 🎨 UI Features

### Theme Toggle
Click the moon/sun icon in the header to switch between dark and light themes.

### Resizable Panels
Drag the splitter between the editor and output to resize panels. Double-click to reset.

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter` - Run code
- `Ctrl/Cmd + S` - Save (auto-saved to localStorage)

## 🛠️ Development

### Running Tests

```bash
cd backend/app
pytest
```

### Code Formatting

```bash
# Python
black backend/
isort backend/

# JavaScript (if using prettier)
npx prettier --write frontend/js/
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Docker](https://www.docker.com/) - Container platform for secure execution

---

<p align="center">
  Made with ❤️ for developers
</p>