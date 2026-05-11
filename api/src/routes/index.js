import {Router} from 'express'
import {router as loteriaRouter} from './loteria.js'

export const router = Router()

router.use(loteriaRouter)