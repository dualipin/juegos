import { Router } from 'express'
import { generateQuestions } from '../controllers/quiz.js'

export const router = Router()

// POST /api/v1/games/quizzes/generate
router.post('/v1/games/quizzes/generate', generateQuestions)
