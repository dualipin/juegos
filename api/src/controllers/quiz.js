import { generateMacuspanaQuestions } from '../service/gemini.service.js'

/**
 * POST /api/v1/games/quizzes/generate
 * Genera preguntas de trivia sobre Macuspana usando IA
 */
export async function generateQuestions(req, res) {
  try {
    const { count = 5, difficulty = 'easy' } = req.body

    // Validar parámetros
    const validDifficulties = ['easy', 'medium', 'hard']
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        error: `Dificultad inválida. Usa: ${validDifficulties.join(', ')}`,
      })
    }

    const maxCount = 10
    const questionCount = Math.min(Math.max(1, parseInt(count)), maxCount)

    const questions = await generateMacuspanaQuestions(questionCount, difficulty)

    return res.json(questions)
  } catch (error) {
    console.error('Error en generateQuestions:', error)
    return res.status(500).json({
      error: 'Error al generar preguntas. Intenta de nuevo.',
      details: error.message,
    })
  }
}
