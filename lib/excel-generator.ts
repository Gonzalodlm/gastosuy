/*
  excel-generator.ts - Generación de archivos Excel (.xlsx)

  Recibe los datos del análisis de Gemini y genera un Excel con 2 hojas:
  1. "Movimientos" - Todos los movimientos con fecha, descripción, categoría y monto
  2. "Resumen" - Tabla resumen por categoría con totales

  Usa la librería "exceljs" que permite crear archivos Excel con formato,
  colores, filtros y más.
*/

import ExcelJS from "exceljs";
import type { AnalisisResultado } from "./gemini";

export async function generateExcel(
  data: AnalisisResultado
): Promise<Buffer> {
  // Crea un nuevo libro de Excel (workbook = libro, worksheet = hoja)
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GastosUY";
  workbook.created = new Date();

  // ============================================================
  // HOJA 1: "Movimientos" - Detalle de cada transacción
  // ============================================================
  const movSheet = workbook.addWorksheet("Movimientos");

  // Define las columnas de la tabla
  movSheet.columns = [
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Descripción", key: "descripcion", width: 40 },
    { header: "Categoría", key: "categoria", width: 22 },
    { header: "Monto", key: "monto", width: 16 },
    { header: "Tipo", key: "tipo", width: 12 },
  ];

  // Estilo del header (primera fila)
  const headerRow = movSheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" }, // azul oscuro
    };
    cell.font = {
      color: { argb: "FFFFFFFF" }, // texto blanco
      bold: true,
      size: 11,
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF334155" } },
    };
  });
  headerRow.height = 28;

  // Agrega cada movimiento como una fila
  data.movimientos.forEach((mov) => {
    const esIngreso = mov.monto >= 0;
    const row = movSheet.addRow({
      fecha: mov.fecha,
      descripcion: mov.descripcion,
      categoria: `${mov.emoji} ${mov.categoria}`,
      monto: mov.monto,
      tipo: esIngreso ? "Ingreso" : "Gasto",
    });

    // Formato de moneda para la columna de monto
    const montoCell = row.getCell("monto");
    montoCell.numFmt = '#,##0.00;[Red]-#,##0.00';

    // Color verde para ingresos, rojo para gastos
    const tipoCell = row.getCell("tipo");
    tipoCell.font = {
      color: { argb: esIngreso ? "FF10B981" : "FFEF4444" },
      bold: true,
    };
    montoCell.font = {
      color: { argb: esIngreso ? "FF10B981" : "FFEF4444" },
    };
  });

  // Agrega filtros automáticos en los headers (el dropdown para filtrar)
  movSheet.autoFilter = {
    from: "A1",
    to: `E${data.movimientos.length + 1}`,
  };

  // ============================================================
  // HOJA 2: "Resumen" - Resumen por categoría
  // ============================================================
  const resSheet = workbook.addWorksheet("Resumen");

  // Título
  resSheet.mergeCells("A1:D1");
  const titleCell = resSheet.getCell("A1");
  titleCell.value = "Resumen de Gastos - GastosUY";
  titleCell.font = { size: 16, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { horizontal: "center" };

  // Subtítulo con la moneda
  resSheet.mergeCells("A2:D2");
  const subtitleCell = resSheet.getCell("A2");
  subtitleCell.value = `Moneda: ${data.moneda}`;
  subtitleCell.font = { size: 11, color: { argb: "FF64748B" } };
  subtitleCell.alignment = { horizontal: "center" };

  // Fila vacía
  resSheet.addRow([]);

  // Headers de la tabla de categorías (fila 4)
  const catHeaderRow = resSheet.addRow(["", "Categoría", "Total", "Porcentaje"]);
  catHeaderRow.eachCell((cell, colNumber) => {
    if (colNumber > 1) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.alignment = { horizontal: "center" };
    }
  });

  // Datos por categoría
  data.resumen.por_categoria.forEach((cat) => {
    const row = resSheet.addRow([
      "",
      cat.categoria,
      cat.total,
      cat.porcentaje / 100,
    ]);
    row.getCell(3).numFmt = '#,##0.00;[Red]-#,##0.00';
    row.getCell(4).numFmt = "0.0%";
  });

  // Fila vacía de separación
  resSheet.addRow([]);

  // Totales finales
  const totalesData = [
    ["", "Total Ingresos", data.resumen.total_ingresos],
    ["", "Total Gastos", data.resumen.total_gastos],
    ["", "Balance", data.resumen.balance],
  ];

  totalesData.forEach(([_, label, value]) => {
    const row = resSheet.addRow(["", label, value]);
    row.getCell(2).font = { bold: true, size: 12 };
    row.getCell(3).numFmt = '#,##0.00;[Red]-#,##0.00';
    row.getCell(3).font = {
      bold: true,
      size: 12,
      color: {
        argb: (value as number) >= 0 ? "FF10B981" : "FFEF4444",
      },
    };
  });

  // Ajuste de anchos de columna
  resSheet.getColumn(2).width = 28;
  resSheet.getColumn(3).width = 18;
  resSheet.getColumn(4).width = 14;

  // Genera el archivo como Buffer (bytes) para enviarlo al navegador
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
