/**
 * Utilidad para convertir texto a voz usando la Web Speech API
 */

import { getLotteryCard } from '../data/cards'

export interface SpeechOptions {
  rate?: number
  pitch?: number
  volume?: number
  language?: string
}

const defaultOptions: SpeechOptions = {
  rate: 1.25,
  pitch: 1,
  volume: 1,
  language: 'es-ES',
}

/**
 * Hablar un texto
 */
export function speak(text: string, options: SpeechOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options }

  // Cancelar cualquier síntesis en progreso
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = mergedOptions.rate!
  utterance.pitch = mergedOptions.pitch!
  utterance.volume = mergedOptions.volume!
  utterance.language = mergedOptions.language!

  // Seleccionar voz en español si está disponible
  const voices = window.speechSynthesis.getVoices()
  const spanishVoice = voices.find((voice) => voice.lang.startsWith('es'))
  if (spanishVoice) {
    utterance.voice = spanishVoice
  }

  window.speechSynthesis.speak(utterance)
}

/**
 * Hablar una carta con formato especial
 */
export function speakCard(card: string) {
  const cardData = getLotteryCard(card)
  if (cardData) {
    speak(`${cardData.nombre}. ${cardData.verso}`)
    return
  }

  speak(`Carta ${card}`)
}

/**
 * Esperar a que termine la síntesis actual
 */
export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking
}

/**
 * Cancelar síntesis en progreso
 */
export function stopSpeech() {
  window.speechSynthesis.cancel()
}

/**
 * Cargar voces disponibles
 */
export function getAvailableVoices() {
  return window.speechSynthesis.getVoices()
}
