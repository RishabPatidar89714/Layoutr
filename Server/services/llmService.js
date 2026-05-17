import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildSystemPrompt } from '../prompts/systemPrompt.js'
import { safeParseLLMJson } from '../utils/jsonValidator.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function callLayoutAgent({ message, layout, history = [] }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const prompt = buildSystemPrompt(layout) + `\n\nInstruction: ${message}`
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = safeParseLLMJson(text)
  return {
    explanation: parsed.explanation || 'Layout updated.',
    changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    updatedLayout: parsed.updatedLayout,
  }
}