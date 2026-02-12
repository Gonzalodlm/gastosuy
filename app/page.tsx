"use client";

/*
  page.tsx - Página principal de GastosUY

  Esta es la página que ve el usuario cuando entra a la app.
  Coordina todo el flujo:
  1. Muestra el upload de PDF (FileUpload)
  2. Envía el PDF al servidor (/api/analyze)
  3. Muestra los resultados (ResultsPreview)
  4. Permite descargar el Excel (/api/download)

  "use client" porque necesita estados y eventos del navegador.
*/

import { useState } from "react";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import ResultsPreview from "@/components/ResultsPreview";

// Tipo para los datos del análisis (lo mismo que devuelve Gemini)
interface AnalysisData {
  movimientos: Array<{
    fecha: string;
    descripcion: string;
    categoria: string;
    emoji: string;
    monto: number;
  }>;
  resumen: {
    total_ingresos: number;
    total_gastos: number;
    balance: number;
    por_categoria: Array<{
      categoria: string;
      total: number;
      porcentaje: number;
    }>;
  };
  moneda: string;
}

export default function HomePage() {
  // Estados de la página
  const [isLoading, setIsLoading] = useState(false); // procesando PDF
  const [isDownloading, setIsDownloading] = useState(false); // generando Excel
  const [results, setResults] = useState<AnalysisData | null>(null); // resultados del análisis
  const [error, setError] = useState<string | null>(null); // mensajes de error

  // Se ejecuta cuando el usuario selecciona un PDF
  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Crea un FormData (la forma estándar de enviar archivos por HTTP)
      const formData = new FormData();
      formData.append("pdf", file);

      // Envía el PDF al servidor para procesarlo
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      // Verifica que la respuesta sea JSON antes de parsearla
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("El servidor no respondió correctamente. Intentá de nuevo.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error procesando el archivo.");
      }

      // Guardamos los resultados para mostrarlos
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error inesperado. Intentá de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Se ejecuta cuando el usuario hace click en "Descargar Excel"
  const handleDownload = async () => {
    if (!results) return;

    setIsDownloading(true);

    try {
      // Envía los datos al servidor para generar el Excel
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results),
      });

      if (!response.ok) {
        throw new Error("Error generando el Excel.");
      }

      // Convierte la respuesta a un Blob (archivo binario)
      const blob = await response.blob();

      // Crea un link temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "GastosUY_Resumen.xlsx";
      document.body.appendChild(a);
      a.click();

      // Limpia el link temporal
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error descargando el Excel."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Zona de upload (siempre visible) */}
          <FileUpload
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
          />

          {/* Estado de loading: se muestra mientras Gemini procesa */}
          {isLoading && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-sm border border-slate-100">
                {/* Spinner animado */}
                <svg
                  className="animate-spin h-5 w-5 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-slate-600 font-medium">
                  Analizando tu estado de cuenta...
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Esto puede tardar unos segundos
              </p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
              <p className="font-medium">Algo salió mal</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setResults(null);
                }}
                className="mt-3 text-sm underline hover:text-red-800"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* Resultados: se muestran después de procesar */}
          {results && (
            <ResultsPreview
              data={results}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-400 border-t border-slate-100">
        Hecho en Uruguay 🇺🇾
      </footer>
    </>
  );
}
