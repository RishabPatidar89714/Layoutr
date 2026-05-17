# Compra — Chat-Based Layout Agent

A web application where you chat with an AI to transform design layouts using natural language. Powered by Claude Sonnet.

## What it does

- **Chat with the agent** — type instructions like "Convert to 9:16" or "Move the headline to the top"
- **Live wireframe preview** — see layout changes instantly, color-coded by element type
- **JSON viewer** — inspect the raw layout JSON with syntax highlighting + copy button
- **Change history** — track every transformation made in the session

## Setup

### Prerequisites
- Node.js v18 or newer
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env and replace with your actual API key:
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run the app

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server starts at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App opens at http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Example prompts to try

```
Convert this design to 9:16
Convert to 16:9 landscape
Move the headline to the top
Make the headline smaller
Move the offer badge higher
Keep the product large
Center the product
Make the discount badge bigger
Move the subheadline lower
```

The agent maintains context across the conversation, so follow-ups like "make it bigger" or "move it higher" work as expected.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Inline styles + Tailwind (minimal) |
| Backend | Node.js + Express |
| LLM | Claude Sonnet via Anthropic SDK |
| State | React hooks (useState, useCallback) |

## Project structure

```
layout-agent/
├── client/src/
│   ├── components/
│   │   ├── ChatWindow.jsx     # Scrollable message history + quick prompts
│   │   ├── MessageBubble.jsx  # Individual message bubble
│   │   ├── ChatInput.jsx      # Textarea + send button
│   │   ├── WireframePreview.jsx  # Live canvas wireframe
│   │   └── JsonViewer.jsx     # JSON viewer + change log tabs
│   ├── hooks/
│   │   └── useLayoutAgent.js  # All chat + layout state logic
│   ├── utils/api.js           # Axios client
│   └── data/initialLayout.json
│
└── server/
    ├── routes/chat.js         # POST /api/chat
    ├── services/
    │   ├── llmService.js      # Anthropic SDK call
    │   └── layoutTransforms.js  # resizeArtboard, moveNode, scaleNode helpers
    ├── prompts/systemPrompt.js  # The full LLM prompt
    ├── utils/jsonValidator.js   # Input + output validation
    └── index.js               # Express entry point
```
