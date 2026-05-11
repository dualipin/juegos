import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MACUSPANA_PROMPT = `Eres un experto en la cultura, historia, geografía, gastronomía, tradiciones y datos curiosos de Macuspana, Tabasco, México.

Genera exactamente {count} preguntas de trivia sobre Macuspana con las siguientes reglas:
- Las preguntas deben ser variadas: historia, geografía, cultura, gastronomía, personajes ilustres, tradiciones, fauna, flora, economía, sitios turísticos, etc.
- Cada pregunta debe tener exactamente 4 opciones de respuesta
- Solo una opción debe ser correcta
- Las opciones incorrectas deben ser plausibles pero claramente distinguibles
- La dificultad debe ser "{difficulty}"
  - "easy": preguntas de conocimiento general sobre Macuspana que la mayoría conocería
  - "medium": preguntas que requieren un conocimiento moderado de Macuspana
  - "hard": preguntas que requieren un conocimiento profundo y detallado de Macuspana
- Las preguntas deben ser en español
- NO repitas preguntas
- Asegúrate de que las respuestas sean factualmente correctas

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin bloques de código) con el siguiente formato:
[
  {
    "question": "¿Pregunta sobre Macuspana?",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "answer": "Opción correcta (debe ser exactamente igual a una de las opciones)",
    "difficulty": "{difficulty}"
  }
]`

/**
 * Genera preguntas de trivia sobre Macuspana usando Gemini AI
 * @param {number} count - Número de preguntas a generar
 * @param {'easy' | 'medium' | 'hard'} difficulty - Dificultad de las preguntas
 * @param {Array<string>} excludeQuestions - Lista de preguntas a evitar
 * @returns {Promise<Array>} Array de preguntas generadas
 */
export async function generateMacuspanaQuestions(count = 5, difficulty = 'easy', excludeQuestions = []) {
  let prompt = MACUSPANA_PROMPT
    .replace(/{count}/g, String(count))
    .replace(/{difficulty}/g, difficulty)

  if (excludeQuestions && excludeQuestions.length > 0) {
    prompt += `\n\nIMPORTANTE: NO generes ninguna de las siguientes preguntas (ya han sido mostradas):
${excludeQuestions.map((q) => `- ${q}`).join('\n')}`
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text().trim()

    // Limpiar posible markdown wrapping
    const cleanText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const questions = JSON.parse(cleanText)

    // Validar estructura
    if (!Array.isArray(questions)) {
      throw new Error('La respuesta de Gemini no es un array válido')
    }

    return questions.map((q) => ({
      id: null,
      question: q.question,
      options: q.options,
      answer: q.answer,
      difficulty: q.difficulty || difficulty,
      created_by: 'IA',
    }))
  } catch (error) {
    console.error('Error generando preguntas con Gemini:', error)
    throw new Error(`Error al generar preguntas: ${error.message}`)
  }
}

