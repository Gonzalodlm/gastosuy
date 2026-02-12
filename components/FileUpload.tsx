"use client";

/*
  FileUpload - Componente de carga de archivos PDF

  Permite al usuario:
  1. Arrastrar y soltar un PDF en el área
  2. O hacer click para seleccionar un archivo

  "use client" arriba significa que este componente corre en el navegador
  (no en el servidor), porque necesita interactividad (eventos de mouse, estados, etc.)
*/

import { useState, useRef, DragEvent, ChangeEvent } from "react";

// Props = las propiedades que recibe este componente desde su padre
interface FileUploadProps {
  onFileSelected: (file: File) => void; // función que se ejecuta cuando el usuario elige un archivo
  isLoading: boolean; // si está procesando, deshabilitamos el upload
}

export default function FileUpload({
  onFileSelected,
  isLoading,
}: FileUploadProps) {
  // Estado: controla si el usuario está arrastrando un archivo sobre el área
  const [isDragging, setIsDragging] = useState(false);
  // Estado: nombre del archivo seleccionado (para mostrarlo)
  const [fileName, setFileName] = useState<string | null>(null);
  // Estado: mensaje de error si el archivo no es válido
  const [error, setError] = useState<string | null>(null);

  // Referencia al input de archivo oculto (para activarlo al hacer click)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valida que el archivo sea un PDF y no sea demasiado grande
  const validateFile = (file: File): boolean => {
    setError(null);

    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF. Seleccioná un archivo .pdf");
      return false;
    }

    // Límite de 10 MB (los estados de cuenta no deberían pesar más)
    const maxSize = 10 * 1024 * 1024; // 10 MB en bytes
    if (file.size > maxSize) {
      setError("El archivo es demasiado grande. Máximo 10 MB.");
      return false;
    }

    return true;
  };

  // Se ejecuta cuando el usuario suelta un archivo en el área
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // evita que el navegador abra el archivo
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setFileName(file.name);
      onFileSelected(file); // le pasa el archivo al componente padre
    }
  };

  // Se ejecuta cuando el usuario arrastra un archivo sobre el área
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Se ejecuta cuando el archivo arrastrrado sale del área
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Se ejecuta cuando el usuario selecciona un archivo con el botón
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Área de drag & drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-emerald-400 bg-emerald-50 scale-[1.02]"
              : "border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {/* Ícono de documento */}
        <div className="text-5xl mb-4">
          {fileName ? "✅" : "📄"}
        </div>

        {fileName ? (
          // Si ya se seleccionó un archivo, muestra el nombre
          <div>
            <p className="text-lg font-semibold text-slate-700">{fileName}</p>
            <p className="text-sm text-slate-500 mt-1">
              Archivo seleccionado correctamente
            </p>
          </div>
        ) : (
          // Si no, muestra las instrucciones
          <div>
            <p className="text-lg font-semibold text-slate-700">
              Arrastrá tu PDF acá
            </p>
            <p className="text-sm text-slate-500 mt-1">
              o hacé click para seleccionar
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Estado de cuenta o resumen de tarjeta (.pdf, máx. 10 MB)
            </p>
          </div>
        )}
      </div>

      {/* Input de archivo oculto (se activa al hacer click en el área) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mensaje de error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
