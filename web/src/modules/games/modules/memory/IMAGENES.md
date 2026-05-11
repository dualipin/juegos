# Guía de Imágenes - Memorama Tabasqueño

## Imágenes Disponibles

Las siguientes imágenes se encuentran en `src/modules/games/modules/memory/assets/img/`:

| Archivo | Categoría | Uso Actual | Mejora Sugerida |
|---------|-----------|-----------|-----------------|
| `cascadas.jpg` | Naturaleza | Cascadas Agua Blanca, Aves Tropicales, Mono Saraguato | Mostrar directamente en las cartas |
| `ganaderia.jpg` | Naturaleza | Ganadería Local | Mostrar en las cartas |
| `manati.png` | Fauna | Manatí | Reemplazar ícono 🐳 con imagen |
| `parque-central.jpg` | Arquitectura | Parque Central, Parroquia San Antonio, Danza, Trajes | Mostrar directamente |
| `pejelagarto.jpg` | Gastronomía | Pejelagarto, Tamales de Chipilín | Mostrar en las cartas |
| `pozol.jpg` | Gastronomía | Pozol con Cacao, Dulces de Coco | Mostrar en las cartas |
| `tortuguero.jpg` | Naturaleza | Cerro Tortuguero | Mostrar en las cartas |

## Cómo Integrar Imágenes Reales

### Opción 1: URLs Públicas (Más Fácil)
Actualizar el archivo `culturalCategories.ts` con URLs externas:

```typescript
export const culturalCategories: CulturalCard[] = [
  {
    id: 'cascadas-agua-blanca',
    name: 'Cascadas Agua Blanca',
    category: 'nature',
    description: 'Reserva ecológica imprescindible',
    funFact: 'Famosa por sus cascadas de agua cristalina...',
    image: 'https://example.com/cascadas.jpg', // URL pública
    icon: '💧',
  },
  // ...
]
```

### Opción 2: Assets Locales (Recomendado)
1. Copiar las imágenes a `src/modules/games/modules/memory/assets/img/`
2. Importarlas en el composable:

```typescript
import cascadasImg from '../assets/img/cascadas.jpg'
import manatiImg from '../assets/img/manati.png'
// ...

export const culturalCategories: CulturalCard[] = [
  {
    id: 'cascadas-agua-blanca',
    name: 'Cascadas Agua Blanca',
    image: cascadasImg, // Importado
  },
  // ...
]
```

3. En `MemoryGame.vue`, las imágenes se mostrarán automáticamente en las cartas.

### Opción 3: Hybrid (Imágenes locales + fallback a ícono)
El código actual ya soporta esto:

```vue
<div class="h-20 w-full flex items-center justify-center overflow-hidden rounded">
  <img
    v-if="card.image && card.image.includes('http')"
    :src="card.image"
    :alt="card.name"
    class="h-full w-full object-cover"
  />
  <div v-else class="h-full w-full flex items-center justify-center">
    <span class="text-4xl">{{ card.icon }}</span>
  </div>
</div>
```

**Si no hay imagen (o es local), muestra el ícono.**

## Optimizar Imágenes

### Con Vite + Sharp (Recomendado):

1. Instalar:
```bash
npm install -D vite-plugin-image-optimization
```

2. En `vite.config.ts`:
```typescript
import ImageOptimization from 'vite-plugin-image-optimization'

export default defineConfig({
  plugins: [
    // ... otros plugins
    ImageOptimization(),
  ],
})
```

### Manual (Compresión):
```bash
# Usando ImageMagick
magick convert cascadas.jpg -quality 80 -resize 500x cascadas-optimized.jpg
```

## Próximos Pasos

1. **Verificar las imágenes existentes** en la carpeta `assets/img/`
2. **Elegir método de integración** (recomendado: Opción 2)
3. **Actualizar `culturalCategories.ts`** con las rutas correctas
4. **Probar en dev mode** con `npm run dev`
5. **Optimizar imágenes** si es necesario

## Estructura de Rutas

```
web/
└── src/
    └── modules/
        └── games/
            └── modules/
                └── memory/
                    ├── assets/
                    │   └── img/
                    │       ├── cascadas.jpg ✓
                    │       ├── ganaderia.jpg ✓
                    │       ├── manati.png ✓
                    │       ├── parque-central.jpg ✓
                    │       ├── pejelagarto.jpg ✓
                    │       ├── pozol.jpg ✓
                    │       └── tortuguero.jpg ✓
                    ├── data/
                    │   └── culturalCategories.ts
                    ├── views/
                    │   └── MemoryGame.vue
                    └── ...
```

## Ejemplo Completo Actualizado

```typescript
// culturalCategories.ts
import cascadasImg from '../assets/img/cascadas.jpg'
import manatiImg from '../assets/img/manati.png'

export const culturalCategories: CulturalCard[] = [
  {
    id: 'cascadas-agua-blanca',
    name: 'Cascadas Agua Blanca',
    category: 'nature',
    description: 'Reserva ecológica imprescindible',
    funFact: 'Famosa por sus cascadas de agua cristalina y grutas naturales...',
    image: cascadasImg,
    icon: '💧',
  },
  {
    id: 'manati',
    name: 'Manatí',
    category: 'fauna',
    description: 'Símbolo de la región acuática',
    funFact: 'Mamífero marino en peligro de extinción...',
    image: manatiImg,
    icon: '🐳',
  },
  // ... resto de categorías
]
```

Así las imágenes se mostrarán en las cartas automáticamente. 🎮
