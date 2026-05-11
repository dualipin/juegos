import {Router} from 'express'
import {router as loteriaRouter} from './loteria.js'
import {router as quizRouter} from './quiz.js'

export const router = Router()

router.use(loteriaRouter)
router.use(quizRouter)