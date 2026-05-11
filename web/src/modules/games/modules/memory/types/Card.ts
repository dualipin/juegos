export type TGameCard = Partial<{
  id: number
  name: string
  formula: string
  symbol?: string
  atomicNumber?: number
  category?: string
  funFact?: string
  description?: string
  image?: string
  type: 'element' | 'compound' | 'cultural'
  icon: string
  isFlipped?: boolean
  isMatched?: boolean
  isDescription?: boolean
  /** Clase de DaisyUI para el fondo (bg-primary, bg-success, etc) */
  colorBg?: string
  /** Clase de DaisyUI para el texto (text-primary-content, etc) */
  colorText?: string
  /** Clase de DaisyUI para el borde (border-primary, etc) */
  colorBorder?: string
}>
