# Approach

## How I structured the LLM prompt

The system prompt is the most critical piece. It's built dynamically — the current layout JSON is injected at the end so the model has full context on every request.

The prompt is organized into sections:
1. **JSON structure** — explains the dual coordinate system (absolute + normalized). The key insight is that normalized values (nx, ny, nw, nh) are the source of truth. Absolute values are always derived from them.
2. **Semantic roles** — maps node names and content to human-readable roles (headline, product, badge, etc.) so the model can resolve natural language references like "the offer badge" or "the headline".
3. **Transformation rules** — explicit step-by-step instructions for the most common operations (aspect ratio resize, move, scale). This prevents hallucination and ensures correct coordinate math.
4. **Output format** — strict schema with `explanation`, `changes[]`, and `updatedLayout`. The model must return raw JSON only.

## How I handle JSON transformations safely

Two-layer defense:
1. **Backend helpers** (`layoutTransforms.js`) — `resizeArtboard`, `moveNode`, `scaleNode` are pure functions that never mutate input (using `JSON.parse(JSON.stringify(...))` for deep cloning). These could be used as "tool calls" in a more sophisticated setup.
2. **Validation on both ends** — `jsonValidator.js` runs on the incoming layout (from client) AND on the LLM's returned layout before sending it back. If the LLM returns an invalid layout, the server falls back to the original and tells the user to retry. `safeParseLLMJson` strips markdown fences and finds the JSON object boundary defensively.

## How I maintain conversation context

The client sends the last 8 messages as `history` on every request. The server passes these directly to the Claude messages array before the new user message. This lets the model resolve pronouns ("it", "that", "the badge") against previous turns.

The current layout JSON is always in the system prompt (not in the message history) so it doesn't double-count tokens but is always present.

## Trade-offs and what I'd improve

**Made:**
- Chose to inject the layout into the system prompt (not as a user message) — cleaner separation of concerns, but means the system prompt is large on every request. Alternative: keep layout in message history.
- Single `/api/chat` endpoint for everything — simpler, but a real app might want separate endpoints for specific operations (resize, move) that use the transform helpers directly and skip the LLM entirely.
- No streaming — the full response arrives at once. Streaming would feel faster for large layouts.

**Would improve:**
- **Structured tool use** — instead of asking the LLM to return a full JSON, use Claude's tool_use feature with typed tools like `resize_artboard(width, height)`, `move_node(id, position)`. Much more reliable.
- **Undo/redo stack** — store a history of layout states so users can step back.
- **Selection highlighting** — let users click a node in the wireframe to select it, then ask the agent to modify "the selected element".
- **Real rendering** — use the actual image URLs to show a pixel-accurate preview instead of colored boxes.
- **Diff highlighting** — visually highlight which nodes changed between the previous and current layout.
