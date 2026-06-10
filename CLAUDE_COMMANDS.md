# 🛠️ Claude Code Command Reference

This document provides a comprehensive list of available commands and skills in Claude Code, categorized by their primary purpose.

## ⚡ Core CLI Commands
These commands manage the session, the environment, and the interface.

| Command | Description |
| :--- | :--- |
| `/init` | Initializes a `CLAUDE.md` file with codebase documentation. |
| `/add-dir` | Adds a new working directory to the current session. |
| `/agents` | Manage and configure specialized agents. |
| `/background` | Sends the current session to the background to free the terminal. |
| `/branch` | Creates a branch of the current conversation to explore different paths. |
| `/btw` | Ask a quick side question without interrupting the main conversation flow. |
| `/clear` | Starts a new session with empty context (previous session remains on disk). |
| `/color` | Changes the color of the prompt bar for the current session. |
| `/compact` | Summarizes the conversation history to free up token context. |
| `/config` | Opens the configuration panel to adjust settings. |
| `/context` | Visualizes current token usage as a colored grid. |
| `/copy` | Copies the last response to the clipboard (use `/copy N` for older responses). |
| `/diff` | Shows uncommitted git changes and per-turn diffs. |
| `/model` | Changes the active AI model for the session. |
| `/fast` | Toggles "Fast Mode" for quicker output (uses a faster model variant). |
| `/resume` | Resumes a previously saved session from disk. |
| `/tasks` | Manages the structured task list and progress tracking. |
| `/workflows` | Manages and monitors active multi-agent workflows. |
| `/skills` | Lists all available specialized skills. |

---

## 🎓 Specialized Skills
Skills are expert modules designed for specific software engineering tasks.

| Skill | Description |
| :--- | :--- |
| `/deep-research` | Conducts multi-source, fact-checked research and synthesizes a cited report. |
| `/update-config` | Configures harness settings, permissions, and automated hooks. |
| `/keybindings-help` | Help with customizing keyboard shortcuts and rebinding keys. |
| `/verify` | Runs the app and observes behavior to validate a code change manually. |
| `/code-review` | Reviews the current diff for bugs, efficiency, and correctness. |
| `/simplify` | Refactors code for better reuse, altitude, and efficiency. |
| `/fewer-permission-prompts` | Scans transcripts to automatically create a permission allowlist. |
| `/loop` | Runs a prompt or command on a recurring interval (e.g., every 5 mins). |
| `/claude-api` | specialized help for building/optimizing apps using the Anthropic SDK. |
| `/run` | Launches and drives the project's app to see a change working in real-time. |
| `/review` | Performs a structured review of a pull request. |
| `/security-review` | Conducts a security audit on pending changes. |
