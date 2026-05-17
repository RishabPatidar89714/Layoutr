import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '../prompts/systemPrompt.js'
import { safeParseLLMJson } from '../utils/jsonValidator.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Call Claude with the current layout + conversation history + user instruction.
 * Returns { explanation, changes, updatedLayout }.
 */
export async function callLayoutAgent({ message, layout, history = [] }) {
  const systemPrompt = buildSystemPrompt(layout)

  // Build the messages array — history first, then the new instruction
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    {
      role: 'user',
      content: `Instruction: ${message}\n\nCurrent layout is already in the system prompt. Apply the instruction and return the updated layout JSON.`,
    },
  ]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages,
  })

  const rawText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

  const parsed = safeParseLLMJson(rawText)

  return {
    explanation: parsed.explanation || 'Layout updated.',
    changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    updatedLayout: parsed.updatedLayout,
  }
}
