import {Router} from 'express'
import { obtenerSalas, crearSala, unirseSala, obtenerSala, eliminarSala } from '../controllers/loteria.js'

export const router = Router()

router.get('/v1/games/lottery/rooms', obtenerSalas)
router.post('/v1/games/lottery/rooms', crearSala)
router.post('/v1/games/lottery/rooms/join', unirseSala)
router.get('/v1/games/lottery/rooms/:roomCode', obtenerSala)
router.delete('/v1/games/lottery/rooms/:roomCode', eliminarSala)
