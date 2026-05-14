import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MACUSPANA_PROMPT = `Eres un experto estricto en la cultura, historia, geografía, gastronomía, tradiciones y datos reales de Macuspana, Tabasco, México.

Genera exactamente {count} preguntas de trivia sobre Macuspana con las siguientes reglas estrictas:
- Las preguntas deben basarse ÚNICAMENTE en datos históricos, geográficos y culturales reales, comprobables y verídicos del municipio de Macuspana, Tabasco.
- GEOGRAFÍA ESTRICTA: Macuspana se ubica en el estado de Tabasco, México. Sus ríos principales son el Puxcatán y el Tulijá. Sus atracciones naturales principales son el Cerro del Tortuguero y las Cascadas de Agua Blanca. Colinda con Chiapas, y con los municipios tabasqueños de Centro, Centla, Jonuta, Jalapa y Tacotalpa. NUNCA asignes a Macuspana características o lugares de otros municipios o estados.
- NO INVENTES información, lugares, nombres de personajes, ni eventos. Si no estás 100% seguro de un dato sobre Macuspana, no hagas una pregunta sobre ese tema.
- Las preguntas deben ser variadas: historia, geografía, cultura, gastronomía, personajes ilustres reales, tradiciones, fauna, flora, sitios turísticos conocidos de Macuspana, etc.
- Cada pregunta debe tener exactamente 4 opciones de respuesta.
- Solo una opción debe ser correcta, exacta y ser un hecho innegable del municipio.
- Las opciones incorrectas deben ser plausibles pero definitivamente falsas, evitando ambigüedades.
- La dificultad debe ser "{difficulty}":
  - "easy": conocimiento general muy común sobre Macuspana (ej. platillos típicos, ubicación básica).
  - "medium": conocimiento moderado sobre tradiciones o lugares específicos del municipio.
  - "hard": conocimiento detallado de la historia o geografía, pero SIEMPRE real y documentado.
- Las preguntas deben ser en español.
- NO repitas preguntas.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin bloques de código) con el siguiente formato:
[
  {
    "question": "¿Pregunta sobre Macuspana?",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "answer": "Opción correcta (debe ser exactamente igual a una de las opciones)",
    "difficulty": "{difficulty}"
  }
]`;

/**
 * Genera preguntas de trivia sobre Macuspana usando Gemini AI
 * @param {number} count - Número de preguntas a generar
 * @param {'easy' | 'medium' | 'hard'} difficulty - Dificultad de las preguntas
 * @param {Array<string>} excludeQuestions - Lista de preguntas a evitar
 * @returns {Promise<Array>} Array de preguntas generadas
 */
export async function generateMacuspanaQuestions(
  count = 5,
  difficulty = "easy",
  excludeQuestions = [],
) {
  let prompt = MACUSPANA_PROMPT.replace(/{count}/g, String(count)).replace(
    /{difficulty}/g,
    difficulty,
  );

  if (excludeQuestions && excludeQuestions.length > 0) {
    prompt += `\n\nIMPORTANTE: NO generes ninguna de las siguientes preguntas (ya han sido mostradas):
${excludeQuestions.map((q) => `- ${q}`).join("\n")}`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.1,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Limpiar posible markdown wrapping
    const cleanText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const questions = JSON.parse(cleanText);

    // Validar estructura
    if (!Array.isArray(questions)) {
      throw new Error("La respuesta de Gemini no es un array válido");
    }

    return questions.map((q) => ({
      id: null,
      question: q.question,
      options: q.options,
      answer: q.answer,
      difficulty: q.difficulty || difficulty,
      created_by: "IA",
    }));
  } catch (error) {
    console.error("Error generando preguntas con Gemini:", error);
    throw new Error(`Error al generar preguntas: ${error.message}`);
  }
}
