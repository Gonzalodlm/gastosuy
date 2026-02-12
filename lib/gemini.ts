/*
  gemini.ts - Integración con Google Gemini API

  Este módulo envía el texto extraído del PDF a Gemini (IA de Google)
  y recibe de vuelta un JSON con los movimientos categorizados.

  Gemini analiza el texto, identifica cada transacción, y la categoriza
  en las categorías que definimos (Supermercado, Transporte, etc.)

  Solo se ejecuta en el servidor para proteger la API key.
*/

import { GoogleGenerativeAI } from "@google/generative-ai";

// El prompt que le damos a Gemini - le explica exactamente qué hacer
const SYSTEM_PROMPT = `Sos un asistente financiero experto en Uruguay. Te voy a dar el texto extraído de un estado de cuenta bancario o de tarjeta de crédito de Uruguay.

Tu tarea es:
1. Identificar cada movimiento/transacción
2. Extraer: fecha, descripción original, monto (positivo = ingreso, negativo = gasto)
3. Categorizar cada movimiento en una de estas categorías:
   - 🏠 Vivienda (alquiler, expensas, UTE, OSE, Antel)
   - 🛒 Supermercado (Tienda Inglesa, Disco, Tata, Devoto, etc.)
   - 🍽️ Gastronomía (restaurantes, delivery, PedidosYa, Rappi)
   - 🚗 Transporte (combustible, Uber, STM, peajes)
   - 💊 Salud (mutualista, farmacia, médicos)
   - 📚 Educación (cursos, universidad, colegios)
   - 🎬 Entretenimiento (streaming, cine, salidas)
   - 👕 Ropa y Shopping
   - 💰 Ingresos (sueldos, transferencias recibidas)
   - 📦 Otros

4. Devolvé ÚNICAMENTE un JSON válido con esta estructura exacta, sin markdown, sin explicaciones:
{
  "movimientos": [
    {
      "fecha": "DD/MM/AAAA",
      "descripcion": "descripción original",
      "categoria": "nombre de categoría",
      "emoji": "emoji de la categoría",
      "monto": -1234.56
    }
  ],
  "resumen": {
    "total_ingresos": 50000.00,
    "total_gastos": -35000.00,
    "balance": 15000.00,
    "por_categoria": [
      {"categoria": "🛒 Supermercado", "total": -8500.00, "porcentaje": 24.3}
    ]
  },
  "moneda": "UYU"
}

IMPORTANTE: Respondé SOLO con el JSON, sin backticks, sin texto adicional.

Acá está el texto del estado de cuenta:
`;

// Tipos TypeScript para la respuesta de Gemini
export interface Movimiento {
  fecha: string;
  descripcion: string;
  categoria: string;
  emoji: string;
  monto: number;
}

export interface CategoriaResumen {
  categoria: string;
  total: number;
  porcentaje: number;
}

export interface AnalisisResultado {
  movimientos: Movimiento[];
  resumen: {
    total_ingresos: number;
    total_gastos: number;
    balance: number;
    por_categoria: CategoriaResumen[];
  };
  moneda: string;
}

export async function analyzeWithGemini(
  pdfText: string
): Promise<AnalisisResultado> {
  // Obtiene la API key de las variables de entorno
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta la API key de Gemini. Configurá GEMINI_API_KEY en .env.local"
    );
  }

  // Crea el cliente de Gemini
  const genAI = new GoogleGenerativeAI(apiKey);

  // Usa el modelo gemini-2.5-flash (gratuito y rápido)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Envía el prompt + el texto del PDF a Gemini
  const result = await model.generateContent(SYSTEM_PROMPT + pdfText);
  const response = result.response;
  const text = response.text();

  // Limpia la respuesta por si Gemini agrega backticks o texto extra
  let cleanText = text.trim();

  // A veces Gemini envuelve el JSON en ```json ... ``` — lo removemos
  if (cleanText.startsWith("```")) {
    cleanText = cleanText
      .replace(/^```json?\s*/, "")
      .replace(/```\s*$/, "")
      .trim();
  }

  // Intenta parsear el JSON
  try {
    const data: AnalisisResultado = JSON.parse(cleanText);

    // Validación básica: verifica que tenga la estructura esperada
    if (!data.movimientos || !data.resumen) {
      throw new Error("La respuesta de Gemini no tiene la estructura esperada");
    }

    return data;
  } catch (parseError) {
    console.error("Error parseando respuesta de Gemini:", cleanText);
    throw new Error(
      "No se pudo interpretar la respuesta de Gemini. Intentá de nuevo."
    );
  }
}
