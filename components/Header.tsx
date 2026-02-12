/*
  Header - Componente del encabezado

  Muestra:
  - El nombre "GastosUY" como logo
  - Un subtítulo explicativo
  - Fondo azul oscuro con texto blanco
*/

export default function Header() {
  return (
    <header className="bg-[#0f172a] text-white py-6 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo / Nombre de la app */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Gastos<span className="text-emerald-400">UY</span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-2 text-slate-300 text-lg">
          Entendé tus gastos en segundos
        </p>
      </div>
    </header>
  );
}
