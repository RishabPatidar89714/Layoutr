import express from 'express'
import { callLayoutAgent } from '../services/llmService.js'
import { validateLayout } from '../utils/jsonValidator.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { message, layout, history = [] } = req.body

    // Input validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string' })
    }
    if (!layout || typeof layout !== 'object') {
      return res.status(400).json({ error: 'layout is required and must be an object' })
    }

    // Validate the incoming layout
    try {
      validateLayout(layout)
    } catch (validationErr) {
      return res.status(400).json({ error: `Invalid input layout: ${validationErr.message}` })
    }

    console.log(`[chat] "${message.slice(0, 60)}"`)

    const result = await callLayoutAgent({ message, layout, history })

    // Validate the LLM-returned layout before sending to client
    if (result.updatedLayout) {
      try {
        validateLayout(result.updatedLayout)
      } catch (validationErr) {
        console.error('LLM returned invalid layout:', validationErr.message)
        // Return original layout with an error note
        return res.json({
          explanation: `I understood your request but the transformation produced an invalid layout. Please try again with a slightly different instruction.`,
          changes: [],
          updatedLayout: layout, // fall back to original
        })
      }
    } else {
      // LLM didn't return an updated layout — keep original
      result.updatedLayout = layout
    }

    res.json(result)
  } catch (err) {
    console.error('[chat] Error:', err.message)

    if (err.status === 401) {
      return res.status(401).json({ error: 'Invalid Anthropic API key. Check your .env file.' })
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' })
    }

    res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

export default router
