/*
  API Route: /api/analyze

  Este es el "backend" de la app. Cuando el usuario sube un PDF,
  el navegador hace un POST a esta ruta con el archivo.

  Flujo:
  1. Recibe el PDF como FormData
  2. Extrae el texto del PDF
  3. Envía el texto a Gemini para categorización
  4. Devuelve el JSON con los resultados
*/

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { analyzeWithGemini } from "@/lib/gemini";

// Permite hasta 60 segundos (Gemini puede tardar un poco)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // 1. Obtiene el archivo del FormData
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo PDF." },
        { status: 400 }
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
    let pdfText: string;
    try {
      pdfText = await extractTextFromPDF(pdfBuffer);
    } catch (pdfError) {
      console.error("Error extrayendo texto del PDF:", pdfError);
      return NextResponse.json(
        { error: "No se pudo leer el PDF. Verificá que no esté dañado o protegido con contraseña." },
        { status: 400 }
      );
    }

    // 4. Envía el texto a Gemini para análisis
    const analysis = await analyzeWithGemini(pdfText);

    // 5. Devuelve los resultados como JSON
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error procesando PDF:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error inesperado procesando el archivo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
