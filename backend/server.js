import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'

import authRoutes from './routes/auth.js'

const PORT = process.env.PORT || 5000
const app = express()

const origins = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(helmet())
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(
  cors({
    origin: origins.length > 0 ? origins : true,
    credentials: true,
  })
)

app.use('/auth', authRoutes)

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port ${PORT}`)
  }
})
