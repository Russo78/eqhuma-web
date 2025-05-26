/**
 * Utilidades para exportación de datos a PDF y Excel
 * 
 * Este módulo proporciona funciones para exportar datos del sistema
 * a diferentes formatos como PDF y Excel.
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as exceljs from 'exceljs';

/**
 * Formatea la fecha actual para usar en nombres de archivos
 * @returns {string} - Fecha formateada como YYYYMMDD-HHMMSS
 */
const obtenerFechaFormateada = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const hour = String(fecha.getHours()).padStart(2, '0');
  const minute = String(fecha.getMinutes()).padStart(2, '0');
  const second = String(fecha.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hour}${minute}${second}`;
};

/**
 * Genera un archivo PDF con la información de una API
 * @param {object} api - Datos de la API para exportar
 * @returns {Blob} - Archivo PDF generado
 */
export const exportarApiPDF = (api) => {
  const doc = new jsPDF();
  
  // Agregar título y encabezado
  doc.setFontSize(20);
  doc.text('eqhuma', 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text(`Documentación: ${api.nombre}`, 105, 25, { align: 'center' });
  
  // Información general
  doc.setFontSize(12);
  doc.text(`Institución: ${api.institucion}`, 14, 40);
  doc.text(`Tipo: ${api.tipo}`, 14, 48);
  doc.text(`Fecha de creación: ${api.fechaCreacion}`, 14, 56);
  doc.text(`Tiempo de respuesta promedio: ${api.tiempoRespuesta} ms`, 14, 64);
  doc.text(`Total de consultas: ${api.consultas.toLocaleString()}`, 14, 72);
  
  // Descripción
  doc.setFontSize(14);
  doc.text('Descripción', 14, 85);
  doc.setFontSize(10);
  const descripcionLines = doc.splitTextToSize(api.documentacion || api.descripcion, 180);
  doc.text(descripcionLines, 14, 95);
  
  // Endpoint
  const yEndpoint = 95 + (descripcionLines.length * 5);
  doc.setFontSize(14);
  doc.text('Endpoint', 14, yEndpoint);
  doc.setFontSize(10);
  doc.text(`${api.metodo || 'POST'} ${api.url}`, 14, yEndpoint + 10);
  
  // Tabla de parámetros
  if (api.parametros && api.parametros.length > 0) {
    const yParametros = yEndpoint + 25;
    doc.setFontSize(14);
    doc.text('Parámetros', 14, yParametros);
    
    const parametrosHeaders = [['Parámetro', 'Tipo', 'Requerido', 'Descripción']];
    const parametrosData = api.parametros.map(p => [
      p.nombre,
      p.tipo,
      p.requerido ? 'Sí' : 'No',
      p.descripcion
    ]);
    
    doc.autoTable({
      startY: yParametros + 5,
      head: parametrosHeaders,
      body: parametrosData,
      theme: 'striped',
      styles: { fontSize: 9 },
      margin: { top: 10 }
    });
  }
  
  // Si hay demasiado contenido, añadir una nueva página
  if (api.parametros && api.parametros.length > 3) {
    doc.addPage();
  }
  
  // Códigos de estado
  if (api.codigosEstado && api.codigosEstado.length > 0) {
    const paginaActual = doc.internal.getCurrentPageInfo().pageNumber;
    const yInicial = (paginaActual > 1) ? 20 : 160;
    
    doc.setFontSize(14);
    doc.text('Códigos de Estado', 14, yInicial);
    
    const codigosHeaders = [['Código', 'Descripción']];
    const codigosData = api.codigosEstado.map(c => [
      c.codigo,
      c.descripcion
    ]);
    
    doc.autoTable({
      startY: yInicial + 5,
      head: codigosHeaders,
      body: codigosData,
      theme: 'striped',
      styles: { fontSize: 9 },
      margin: { top: 10 }
    });
  }
  
  // Precios
  if (api.precios && api.precios.length > 0) {
    // Determinar la posición Y basada en el contenido anterior
    let yPrecios = 200;
    if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
      yPrecios = 100;
    }
    
    doc.setFontSize(14);
    doc.text('Planes de Precios', 14, yPrecios);
    
    const preciosHeaders = [['Plan', 'Precio por Consulta (USD)', 'Cuota Mensual']];
    const preciosData = api.precios.map(p => [
      p.plan,
      `$${p.precio}`,
      p.cuota
    ]);
    
    doc.autoTable({
      startY: yPrecios + 5,
      head: preciosHeaders,
      body: preciosData,
      theme: 'striped',
      styles: { fontSize: 9 },
      margin: { top: 10 }
    });
  }
  
  // Agregar pie de página
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`eqhuma - Documento generado el ${new Date().toLocaleDateString()} - Página ${i} de ${totalPaginas}`, 105, 290, { align: 'center' });
  }
  
  return doc.output('blob');
};

/**
 * Exporta una lista de APIs a un archivo Excel
 * @param {Array} apis - Lista de APIs para exportar
 * @returns {Blob} - Archivo Excel generado
 */
export const exportarApisExcel = (apis) => {
  // Preparar los datos para el formato requerido por exceljs
  const worksheet = exceljs.utils.json_to_sheet(apis.map(api => ({
    'ID': api.id,
    'Nombre': api.nombre,
    'Institución': api.institucion,
    'Descripción': api.descripcion,
    'Tipo': api.tipo,
    'Consultas': api.consultas,
    'Tiempo de Respuesta (ms)': api.tiempoRespuesta,
    'Fecha de Creación': api.fechaCreacion,
    'URL': api.url || ''
  })));
  
  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 5 },  // ID
    { wch: 30 }, // Nombre
    { wch: 15 }, // Institución
    { wch: 50 }, // Descripción
    { wch: 10 }, // Tipo
    { wch: 10 }, // Consultas
    { wch: 10 }, // Tiempo de Respuesta
    { wch: 12 }, // Fecha de Creación
    { wch: 50 }  // URL
  ];
  worksheet['!cols'] = columnWidths;
  
  // Crear libro de trabajo
  const workbook = exceljs.utils.book_new();
  exceljs.utils.book_append_sheet(workbook, worksheet, "APIs");
  
  // Generar archivo
  const excelBuffer = exceljs.write(workbook, { bookType: 'exceljs', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Exporta estadísticas de uso a un archivo Excel
 * @param {object} estadisticas - Datos de estadísticas de uso
 * @returns {Blob} - Archivo Excel generado
 */
export const exportarEstadisticasExcel = (estadisticas) => {
  // Libro de trabajo
  const workbook = exceljs.utils.book_new();
  
  // Hoja de resumen general
  const resumenData = [
    { 'Métrica': 'Total Consultas', 'Valor': estadisticas.totalConsultas },
    { 'Métrica': 'Total APIs Utilizadas', 'Valor': estadisticas.totalApis },
    { 'Métrica': 'Consultas Último Mes', 'Valor': estadisticas.consultasUltimoMes },
    { 'Métrica': 'Tiempo Promedio de Respuesta (ms)', 'Valor': estadisticas.tiempoPromedioRespuesta },
    { 'Métrica': 'Tasa de Éxito (%)', 'Valor': estadisticas.tasaExito },
    { 'Métrica': 'API Más Utilizada', 'Valor': estadisticas.apiMasUtilizada },
    { 'Métrica': 'Cuota Utilizada (%)', 'Valor': estadisticas.cuotaUtilizada }
  ];
  
  const resumenSheet = exceljs.utils.json_to_sheet(resumenData);
  resumenSheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  exceljs.utils.book_append_sheet(workbook, resumenSheet, "Resumen");
  
  // Hoja de historial de consultas
  if (estadisticas.historialConsultas && estadisticas.historialConsultas.length > 0) {
    const historialSheet = exceljs.utils.json_to_sheet(estadisticas.historialConsultas.map(h => ({
      'Fecha': h.fecha,
      'Consultas': h.consultas
    })));
    historialSheet['!cols'] = [{ wch: 15 }, { wch: 10 }];
    exceljs.utils.book_append_sheet(workbook, historialSheet, "Historial");
  }
  
  // Hoja de APIs favoritas
  if (estadisticas.apiFavoritas && estadisticas.apiFavoritas.length > 0) {
    const favoritasSheet = exceljs.utils.json_to_sheet(estadisticas.apiFavoritas.map(a => ({
      'ID': a.id,
      'Nombre API': a.nombre,
      'Consultas': a.consultas
    })));
    favoritasSheet['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 10 }];
    exceljs.utils.book_append_sheet(workbook, favoritasSheet, "APIs Favoritas");
  }
  
  // Generar archivo
  const excelBuffer = exceljs.write(workbook, { bookType: 'exceljs', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Descarga un archivo generado
 * @param {Blob} blob - El archivo a descargar
 * @param {string} nombreArchivo - Nombre del archivo sin extensión
 * @param {string} extension - Extensión del archivo (pdf, exceljs)
 */
export const descargarArchivo = (blob, nombreArchivo, extension) => {
  const fecha = obtenerFechaFormateada();
  const nombreCompleto = `${nombreArchivo}_${fecha}.${extension}`;
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nombreCompleto);
  
  // Necesario para Firefox
  document.body.appendChild(link);
  
  link.click();
  
  // Limpiar
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};