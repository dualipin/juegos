# Actualización del Memorama Tabasqueño 🌴

## Cambios Realizados

### 1. **Nuevas Categorías Culturales**
El juego ahora presenta **temas icónicos del municipio** en lugar de elementos químicos:

#### Categorías:
- **🏛️ Arquitectura y Monumentos**: Parque Central, Parroquia San Antonio
- **🌿 Naturaleza y Paisajes**: Cascadas Agua Blanca, Cerro Tortuguero
- **🎭 Cultura y Tradiciones**: Danza del Baila Viejo, Trajes Típicos
- **🍴 Gastronomía**: Pejelagarto Asado, Tamales de Chipilín, Pozol con Cacao
- **🐾 Fauna Local**: Manatí, Mono Saraguato, Aves Tropicales

Cada categoría tiene colores distintivos:
- Dorado para Arquitectura
- Verde para Naturaleza
- Púrpura para Cultura
- Rojo para Gastronomía
- Azul para Fauna

### 2. **Interfaz Mejorada**

#### Diseño de Cartas:
- **Dorso**: Diseño personalizado con palmera 🌴 y "Tabasco"
- **Frente**: Ícono grande + nombre + categoría
- **Animación 3D**: Volteo suave con CSS transforms
- **Responsivo**: Se adapta a diferentes tamaños de pantalla

#### Controles:
- Selector de cantidad de cartas (4-24)
- Selector de duración (30-300 segundos)
- Botones "Nuevo Juego" y "Reiniciar"

### 3. **Experiencia de Usuario**

#### Modal Informativo:
Cuando encuentran una pareja, aparece un modal que muestra:
- Ícono grande del elemento
- Nombre
- Descripción
- 💡 **Dato Curioso** (dato educativo/cultural)

Ejemplo:
```
Cascadas Agua Blanca
"Reserva ecológica imprescindible"
💡 "Famosa por sus cascadas de agua cristalina y grutas naturales, 
   es un santuario de biodiversidad."
```

#### Confeti Personalizado:
Cuando ganan, aparecen emojis: 🎉 🥳 🎊 🌴 🌊 🐆

### 4. **Archivos Creados/Modificados**

#### Nuevos:
- `src/modules/games/modules/memory/data/culturalCategories.ts`
  - Base de datos con todas las categorías
  - Colores por categoría
  - Funciones helpers

#### Modificados:
- `src/modules/games/modules/memory/composables/useMemoryGame.ts`
  - Reemplazó `buildElementCards` con `buildCulturalCards`
  - Ahora usa categorías culturales
  
- `src/modules/games/modules/memory/types/Card.ts`
  - Agregados campos: `description`, `image`
  - Tipo actualizado a: `'element' | 'compound' | 'cultural'`
  
- `src/modules/games/modules/memory/views/MemoryGame.vue`
  - Interfaz completamente rediseñada
  - Nuevo modal informativo
  - Mejor diseño 3D de cartas
  - Mejor estructura de controles

## Cómo Probar

### En desarrollo:
```bash
cd c:\Users\dualipin\Projects\juegos\web
npm run dev
```

Luego navega al juego de memoria. Deberías ver:
- Título: "Memorama Tabasqueño"
- Cartas con ícones culturales
- Dorso con diseño de palmera

### Interacción:
1. Haz clic en las cartas para voltearlas
2. Encuentra parejas del mismo nombre
3. Cuando encuentres una pareja, aparece el modal con información
4. Gana el juego cuando encuentres todas las parejas

## Próximas Mejoras Sugeridas

1. **Sonidos Ambientales**:
   - Usar la canción que ya existe (cancion.mp3)
   - Efectos de sonido al voltear cartas
   - Música de marimba tabasqueña de fondo

2. **Imágenes Reales**:
   - Las imágenes que están en `assets/img/` pueden mostrarse
   - Usar `image-webpack-loader` para optimizarlas

3. **Efectos de Sonido Mejorados**:
   - Implementar con Web Audio API
   - Efectos al encontrar parejas

4. **Leaderboard Global**:
   - Ya está integrado el ranking
   - Mostrar top 10 jugadores

5. **Más Categorías**:
   - Agregar más elementos culturales
   - Rotación de temas

## Stack Tecnológico Utilizado

✅ Vue 3 (Composition API)
✅ TypeScript
✅ Tailwind CSS + daisyUI
✅ CSS 3D Transforms
✅ js-confetti (animaciones)
✅ Pinia (state management)

## Estructura de Datos

```typescript
interface CulturalCard {
  id: string
  name: string
  category: 'architecture' | 'nature' | 'culture' | 'gastronomy' | 'fauna'
  description: string
  funFact: string
  image: string
  icon: string
}
```

## Notas de Compilación

El proyecto puede tener un error no relacionado en `preline/dist`. Esto está en otro módulo y no afecta el memorama.

Para compilar solo el memorama:
```bash
npm run dev  # Desarrollo
npm run build  # Producción (después de arreglar el error de preline)
```

---

¡El memorama tabasqueño está listo para jugar! 🎮🌴
