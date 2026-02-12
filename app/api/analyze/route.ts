/*
  API Route: /api/analyze

  Este es el "backend" de la app. Cuando el usuario sube un PDF,
  el navegador hace un POST a esta ruta con el archivo.

  Flujo:
  1. Recibe el PDF como FormData (la forma estándar de enviar archivos)
  2. Extrae el texto del PDF usando pdf-parser
  3. Envía el texto a Gemini para categorización
  4. Devuelve el JSON con los resultados

  Este código SOLO se ejecuta en el servidor (nunca en el navegador).
*/

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { analyzeWithGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // 1. Obtiene el archivo del FormData
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo PDF." },
        { status: 400 } // 400 = Bad Request (error del usuario)
      );
    }

    // Verifica que sea un PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "El archivo debe ser un PDF." },
        { status: 400 }
      );
    }

    // 2. Convierte el archivo a Buffer (bytes) para procesarlo
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 3. Extrae el texto del PDF
    const pdfText = await extractTextFromPDF(pdfBuffer);

    // 4. Envía el texto a Gemini para análisis
    const analysis = await analyzeWithGemini(pdfText);

    // 5. Devuelve los resultados como JSON
    return NextResponse.json(analysis);
  } catch (error) {
    // Si algo falla, devuelve un mensaje de error claro
    console.error("Error procesando PDF:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error inesperado procesando el archivo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Configuración: permite archivos de hasta 10 MB
export const config = {
  api: {
    bodyParser: false,
  },
};
