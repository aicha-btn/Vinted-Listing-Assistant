import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'
import { createApp } from './app'

const PORT = Number(process.env.PORT ?? 8787)
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null
const app = createApp({ ai, model: GEMINI_MODEL })

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Gemini server ready on http://127.0.0.1:${PORT}`)
})
