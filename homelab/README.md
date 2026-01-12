# Homelab

Self-hosted automation workflows and configurations for homelab infrastructure.

## Workflows

### n8n Workflows

| Workflow | Description |
|----------|-------------|
| [Slack Chatbot](workflows/slack-chatbot.json) | AI-powered Slack chatbot using OpenRouter and PostgreSQL |

## Getting Started

### Prerequisites

- [n8n](https://n8n.io/) - Workflow automation platform
- [PostgreSQL](https://www.postgresql.org/) - Database for chat memory
- [OpenRouter](https://openrouter.ai/) - LLM API gateway

### Importing Workflows

1. Open your n8n instance
2. Go to Workflows -> Import from File
3. Select the desired workflow JSON file
4. Configure credentials as documented in each workflow's README

## Structure

```
homelab/
├── README.md
└── workflows/
    ├── slack-chatbot.json        # Slack AI chatbot workflow
    └── slack-chatbot.README.md   # Setup documentation
```
