import {Router} from 'express'

export const router = Router()

router.get('/loteria', (req, res) => {
  const numeros = Array.from({length: 6}, () => Math.floor(Math.random() * 60) + 1)
  res.json({numeros})
})
