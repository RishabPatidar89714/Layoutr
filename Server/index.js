import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import chatRoute from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/chat', chatRoute)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n Layout Agent server running at http://localhost:${PORT}`)
  console.log(`   Gemini API key: ${process.env.GEMINI_API_KEY ? '✓ set' : '✗ MISSING — add to .env'}\n`)
})