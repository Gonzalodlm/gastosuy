/*
  API Route: /api/analyze

  Recibe el PDF del usuario y se lo envía directamente a Gemini.
  Gemini lee el PDF y devuelve los movimientos categorizados.
*/

import { NextRequest, NextResponse } from "next/server";
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

    // 2. Convierte el archivo a Buffer (bytes)
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 3. Envía el PDF directamente a Gemini para análisis
    const analysis = await analyzeWithGemini(pdfBuffer);

    // 4. Devuelve los resultados como JSON
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
