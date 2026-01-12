# Slack AI Chatbot - n8n Workflow

An n8n workflow that creates an AI-powered Slack chatbot using OpenRouter for LLM capabilities and PostgreSQL for conversation memory.

## Overview

This workflow enables a Slack bot that:
- Listens for direct messages in a specified Slack channel
- Filters out bot messages to only respond to users
- Shows a "thinking..." status while processing
- Generates AI responses using OpenRouter (supports multiple LLM providers)
- Maintains conversation history using PostgreSQL
- Replies in threaded messages with markdown formatting

## Workflow Architecture

```
On Message Received -> Check If User -> Set Thinking Status
                                    |-> AI Agent -> Send Reply
                                    |-> NoOp (for bot messages)
```

### Nodes

1. **On Message Received** - Slack trigger that listens for messages
2. **Check If User** - Filters to only process user messages (not bot)
3. **Set Thinking Status** - Shows typing indicator in Slack
4. **AI Agent** - LangChain agent that processes the message
5. **OpenRouter Chat Model** - LLM provider for AI responses
6. **Postgres Chat Memory** - Stores conversation history per thread
7. **Send Reply** - Posts the AI response back to Slack

## Prerequisites

- n8n instance (self-hosted or cloud)
- Slack workspace with admin access
- OpenRouter API account
- PostgreSQL database

## Setup Instructions

### 1. Create Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" -> "From scratch"
3. Name your app and select your workspace
4. Under "OAuth & Permissions", add these Bot Token Scopes:
   - `app_mentions:read`
   - `channels:history`
   - `channels:read`
   - `chat:write`
   - `im:history`
   - `im:read`
   - `im:write`
   - `assistant:write` (for thinking status)
5. Install the app to your workspace
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 2. Configure n8n Credentials

Create the following credentials in n8n:

#### Slack API Credential
- Name: `slackApi Credential`
- Access Token: Your bot token from step 1

#### OpenRouter API Credential
- Name: `openRouterApi Credential`
- API Key: Your OpenRouter API key from [openrouter.ai](https://openrouter.ai)

#### HTTP Bearer Auth (for Slack API)
- Name: `httpBearerAuth Credential`
- Token: Your bot token (same as Slack API)

#### PostgreSQL Credential
- Name: `postgres Credential`
- Host, Port, Database, User, Password for your PostgreSQL instance

### 3. Set Up PostgreSQL

Create the chat history table:

```sql
CREATE TABLE IF NOT EXISTS chat_histories (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_histories_session ON chat_histories(session_id);
```

### 4. Import Workflow

1. In n8n, go to Workflows -> Import from File
2. Select `slack-chatbot.json`
3. Update the workflow:
   - **On Message Received**: Set `channelId` to your Slack app's channel ID
   - Verify all credentials are connected

### 5. Get Your Channel ID

1. In Slack, right-click on your bot's DM channel
2. Click "Copy link"
3. The channel ID is the last part of the URL (e.g., `D07ABC123XY`)

### 6. Activate the Workflow

1. Click "Active" toggle in n8n
2. Send a DM to your bot in Slack
3. The bot should respond!

## Customization

### Change the AI System Prompt

Edit the **AI Agent** node's `systemMessage` parameter:

```
You are a helpful, friendly, assistant.

You always respond only nicely formatted markdown where appropriate.
```

### Switch LLM Provider

The workflow uses OpenRouter, which supports many LLM providers:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Meta (Llama)
- And more

Configure the model in the OpenRouter Chat Model node settings.

### Add Tools

Extend the AI Agent with additional tools:
- Web search
- Code execution
- Database queries
- API calls
- File operations

## Troubleshooting

### Bot not responding
- Check n8n execution logs
- Verify channel ID is correct
- Ensure credentials are valid
- Check Slack app permissions

### "Thinking" status not showing
- Verify `assistant:write` scope is added
- Check httpBearerAuth credential

### Memory not working
- Verify PostgreSQL connection
- Check table exists with correct schema
- Ensure thread_ts is being passed correctly

## Environment Variables

For production deployments, consider using environment variables:

```env
SLACK_BOT_TOKEN=xoxb-...
OPENROUTER_API_KEY=sk-or-...
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=...
```
