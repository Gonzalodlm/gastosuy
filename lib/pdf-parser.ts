/*
  pdf-parser.ts - Extracción de texto de PDFs

  Usa pdfjs-dist (la misma librería que usa Firefox para leer PDFs).
  Configurado para funcionar en Vercel serverless (sin worker threads).
*/

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Deshabilitar el worker thread (no existe en serverless)
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // Carga el PDF desde los bytes
  // disableFontFace y isEvalSupported=false son necesarios en serverless
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  });

  const pdf = await loadingTask.promise;
  const textParts: string[] = [];

  // Recorre cada página y extrae el texto
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => (item as { str?: string }).str || "")
      .join(" ");
    textParts.push(pageText);
  }

  await pdf.destroy();

  const text = textParts.join("\n");

  if (text.trim().length === 0) {
    throw new Error(
      "No se pudo extraer texto del PDF. Asegurate de que no sea un PDF escaneado (imagen)."
    );
  }

  return text;
}
