import { useState, useCallback } from 'react'
import { sendChatMessage } from '../utils/api'
import initialLayout from '../data/initialLayout.json'

export function useLayoutAgent() {
  const [layout, setLayout] = useState(initialLayout)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your layout agent. I can transform this Instagram design using natural language. Try: \"Convert to 9:16\", \"Move the headline to the top\", \"Make the product larger\", or \"Move the offer badge higher\".",
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [changes, setChanges] = useState([])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages
        .filter((m) => m.role !== 'system')
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }))

      const result = await sendChatMessage({
        message: text.trim(),
        layout,
        history,
      })

      if (result.updatedLayout) {
        setLayout(result.updatedLayout)
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.explanation || 'Done! Layout updated.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      if (result.changes?.length) {
        setChanges((prev) => [
          {
            id: Date.now().toString(),
            instruction: text.trim(),
            items: result.changes,
            timestamp: new Date(),
          },
          ...prev,
        ])
      }
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          err.response?.data?.error ||
          'Something went wrong. Check your API key and try again.',
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [layout, messages, loading])

  const resetLayout = useCallback(() => {
    setLayout(initialLayout)
    setChanges([])
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Layout has been reset to the original Instagram Post design.',
        timestamp: new Date(),
      },
    ])
  }, [])

  return { layout, messages, loading, changes, sendMessage, resetLayout }
}
