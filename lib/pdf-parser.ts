/*
  pdf-parser.ts - Extracción de texto de PDFs

  Este módulo recibe un archivo PDF (como Buffer de bytes) y devuelve
  todo el texto que contiene como un string.

  Usa la librería "pdf-parse" que internamente lee la estructura del PDF
  y extrae el texto de cada página.

  Solo se ejecuta en el servidor (nunca en el navegador del usuario).
*/

import { PDFParse } from "pdf-parse";

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // PDFParse recibe los bytes del PDF como Uint8Array en el constructor
  const pdfParse = new PDFParse({ data: new Uint8Array(pdfBuffer) });

  // getText() carga el PDF internamente y extrae todo el texto
  const result = await pdfParse.getText();

  // result.text contiene todo el texto del PDF concatenado
  const text = result.text || "";

  // Liberamos los recursos del PDF
  await pdfParse.destroy();

  if (text.trim().length === 0) {
    throw new Error(
      "No se pudo extraer texto del PDF. Asegurate de que no sea un PDF escaneado (imagen)."
    );
  }

  return text;
}
