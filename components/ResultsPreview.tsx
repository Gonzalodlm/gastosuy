"use client";

/*
  ResultsPreview - Muestra los resultados del análisis

  Después de que Gemini procesa el PDF, este componente muestra:
  1. Un resumen con total de ingresos, gastos y balance
  2. Una tabla con el desglose por categoría
  3. Un botón para descargar el Excel
*/

// Tipos de datos que devuelve nuestra API (los mismos que Gemini nos da)
interface CategoriaResumen {
  categoria: string;
  total: number;
  porcentaje: number;
}

interface ResultData {
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
    por_categoria: CategoriaResumen[];
  };
  moneda: string;
}

interface ResultsPreviewProps {
  data: ResultData;
  onDownload: () => void; // función que se ejecuta al hacer click en "Descargar Excel"
  isDownloading: boolean;
}

// Función helper para formatear números como moneda uruguaya
// Ejemplo: -8500.50 → "$ -8.500,50"
function formatMoney(amount: number): string {
  return (
    "$ " +
    amount.toLocaleString("es-UY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function ResultsPreview({
  data,
  onDownload,
  isDownloading,
}: ResultsPreviewProps) {
  const { resumen } = data;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Tarjetas de resumen: Ingresos, Gastos, Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta Ingresos */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Ingresos</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatMoney(resumen.total_ingresos)}
          </p>
        </div>

        {/* Tarjeta Gastos */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Gastos</p>
          <p className="text-xl font-bold text-red-500 mt-1">
            {formatMoney(resumen.total_gastos)}
          </p>
        </div>

        {/* Tarjeta Balance */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Balance</p>
          <p
            className={`text-xl font-bold mt-1 ${
              resumen.balance >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {formatMoney(resumen.balance)}
          </p>
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Gastos por categoría</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-sm text-slate-500">
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {resumen.por_categoria.map((cat, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3 text-sm">{cat.categoria}</td>
                  <td className="px-5 py-3 text-sm text-right font-medium">
                    {formatMoney(cat.total)}
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-slate-500">
                    {cat.porcentaje.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cantidad de movimientos detectados */}
      <p className="text-center text-sm text-slate-500">
        {data.movimientos.length} movimientos detectados
      </p>

      {/* Botón de descarga */}
      <div className="text-center">
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className={`
            inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white
            transition-all duration-200
            ${
              isDownloading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-lg shadow-emerald-500/25"
            }
          `}
        >
          {isDownloading ? (
            <>
              {/* Spinner de carga */}
              <svg
                className="animate-spin h-5 w-5"
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
              Generando Excel...
            </>
          ) : (
            <>📥 Descargar Excel</>
          )}
        </button>
      </div>
    </div>
  );
}
