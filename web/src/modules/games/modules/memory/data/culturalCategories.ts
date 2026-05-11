export interface CulturalCard {
  id: string
  nombre: string
  categoría: 'arquitectura' | 'naturaleza' | 'cultura' | 'gastronomía' | 'fauna'
  descripción: string
  hechoCurioso: string
  imagen: string
  ícono: string
}

export const culturalCategories: CulturalCard[] = [
  // Arquitectura y Monumentos
  {
    id: 'parque-central',
    nombre: 'Parque Central',
    categoría: 'arquitectura',
    descripción: 'Centro histórico de Macuspana',
    hechoCurioso: 'El corazón de la comunidad donde se reúnen los pobladores para celebraciones y eventos importantes.',
    imagen: '/memorama/parque-central.jpg',
    ícono: '🏛️',
  },

  // Naturaleza y Paisajes
  {
    id: 'cascadas-agua-blanca',
    nombre: 'Cascadas Agua Blanca',
    categoría: 'naturaleza',
    descripción: 'Reserva ecológica imprescindible de Macuspana',
    hechoCurioso: 'Famosa por sus cascadas de agua cristalina y grutas naturales, es un santuario de biodiversidad macuspanense.',
    imagen: '/memorama/cascadas.jpg',
    ícono: '💧',
  },
  {
    id: 'cerro-tortuguero',
    nombre: 'Cerro Tortuguero',
    categoría: 'naturaleza',
    descripción: 'Formación geológica distinctive de Macuspana',
    hechoCurioso: 'Montaña emblemática visible desde el pueblo, forma parte de la identidad visual de Macuspana.',
    imagen: '/memorama/tortuguero.jpg',
    ícono: '⛰️',
  },

  // Gastronomía
  {
    id: 'pejelagarto-asado',
    nombre: 'Pejelagarto Asado',
    categoría: 'gastronomía',
    descripción: 'Platillo tradicional emblematico de Macuspana',
    hechoCurioso: 'Pez endémico de las aguas de Macuspana, preparado a las brasas es una delicia culinaria única de la región.',
    imagen: '/memorama/pejelagarto.jpg',
    ícono: '🐟',
  },
  {
    id: 'pozol-cacao',
    nombre: 'Pozol con Cacao',
    categoría: 'gastronomía',
    descripción: 'Bebida ancestral nutritiva de Macuspana',
    hechoCurioso: 'Bebida prehispánica que combina maíz molido con cacao, fundamental en la dieta tradicional macuspanense.',
    imagen: '/memorama/pozol.jpg',
    ícono: '☕',
  },

  // Fauna Local
  {
    id: 'manati',
    nombre: 'Manatí',
    categoría: 'fauna',
    descripción: 'Símbolo de la región acuática de Macuspana',
    hechoCurioso: 'Mamífero marino en peligro de extinción, emblema de la conservación ambiental de las aguas de Macuspana.',
    imagen: '/memorama/manati.png',
    ícono: '🐳',
  },

  // Naturaleza adicional
  {
    id: 'ganaderia-campos',
    nombre: 'Ganadería Local',
    categoría: 'naturaleza',
    descripción: 'Actividad económica importante de Macuspana',
    hechoCurioso: 'Los extensos campos macuspanenses son el hogar de ganado criado con técnicas tradicionales y sostenibles.',
    imagen: '/memorama/ganaderia.jpg',
    ícono: '🐄',
  },

  // Aves
  {
    id: 'aves-macuspana',
    nombre: 'Aves de Macuspana',
    categoría: 'fauna',
    descripción: 'Diversidad de aves propias de la región',
    hechoCurioso: 'Macuspana es hogar de diversas especies de aves tropicales, pilares de la biodiversidad local y atractivo para observadores de aves.',
    imagen: '/memorama/aves.jpg',
    ícono: '🦅',
  },
]

export const getCategoryColors = (
  categoría: CulturalCard['categoría']
): { bgClass: string; textClass: string; borderClass: string } => {
  const colores: Record<
    CulturalCard['categoría'],
    { bgClass: string; textClass: string; borderClass: string }
  > = {
    arquitectura: {
      bgClass: 'bg-primary',
      textClass: 'text-primary-content',
      borderClass: 'border-primary',
    },
    naturaleza: {
      bgClass: 'bg-success',
      textClass: 'text-success-content',
      borderClass: 'border-success',
    },
    cultura: {
      bgClass: 'bg-secondary',
      textClass: 'text-secondary-content',
      borderClass: 'border-secondary',
    },
    gastronomía: {
      bgClass: 'bg-warning',
      textClass: 'text-warning-content',
      borderClass: 'border-warning',
    },
    fauna: {
      bgClass: 'bg-info',
      textClass: 'text-info-content',
      borderClass: 'border-info',
    },
  }
  return colores[categoría]
}

export const getCategoryLabel = (categoría: CulturalCard['categoría']): string => {
  const etiquetas: Record<CulturalCard['categoría'], string> = {
    arquitectura: 'Arquitectura',
    naturaleza: 'Naturaleza',
    cultura: 'Cultura',
    gastronomía: 'Gastronomía',
    fauna: 'Fauna',
  }
  return etiquetas[categoría]
}
