/*
  API Route: /api/download

  Recibe los datos del análisis (JSON) y genera un archivo Excel (.xlsx).
  Devuelve el archivo para que el navegador lo descargue.

  Flujo:
  1. Recibe el JSON con movimientos y resumen
  2. Genera el Excel con exceljs
  3. Devuelve el archivo como descarga
*/

import { NextRequest, NextResponse } from "next/server";
import { generateExcel } from "@/lib/excel-generator";
import type { AnalisisResultado } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // 1. Recibe los datos del análisis
    const data: AnalisisResultado = await request.json();

    // Validación básica
    if (!data.movimientos || !data.resumen) {
      return NextResponse.json(
        { error: "Datos de análisis inválidos." },
        { status: 400 }
      );
    }

    // 2. Genera el archivo Excel
    const excelBuffer = await generateExcel(data);

    // 3. Devuelve el archivo como descarga
    // Los headers le dicen al navegador que es un archivo para descargar
    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="GastosUY_Resumen.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error generando Excel:", error);
    return NextResponse.json(
      { error: "Error generando el archivo Excel." },
      { status: 500 }
    );
  }
}
