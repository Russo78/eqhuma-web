import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApiData } from '../context/ApiDataContext';
import Header from '../components/Header';
import ApiDetailContent from '../components/ApiDetailContent';
import { exportarApiPDF, descargarArchivo } from '../utils/exportUtils';

/**
 * Página de detalle de una API específica
 * Muestra información completa, documentación técnica y opciones de contratación
 */
const ApiDetail = () => {
  const { apiId } = useParams();
  const { obtenerDetalleApi, apiActual, loading, error } = useApiData();
  const [activeTab, setActiveTab] = useState('documentacion');

  // Cargar los detalles de la API al montar el componente
  useEffect(() => {
    obtenerDetalleApi(apiId);
  }, [apiId]);

  /**
   * Maneja la exportación a PDF de la documentación
   */
  const handleExportPDF = () => {
    if (apiActual) {
      const pdfBlob = exportarApiPDF(apiActual);
      descargarArchivo(pdfBlob, `API_${apiActual.nombre.replace(/\s+/g, '_')}`, 'pdf');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enlace para volver atrás */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-[#4a90e2] hover:text-[#3a7bc8]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Marketplace
          </Link>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#4a90e2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg text-[#4a90e2]">Cargando detalles de la API...</span>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Contenido principal */}
        {!loading && apiActual && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Cabecera */}
            <div className="p-6 border-b border-[#eaeef3]">
              <span className="inline-block px-2 py-1 bg-[#e8f4fd] text-[#4a90e2] text-xs font-semibold rounded mb-2">
                {apiActual.institucion}
              </span>
              <h1 className="text-3xl font-bold text-[#2c3e50] mt-2 mb-3">{apiActual.nombre}</h1>
              <p className="text-[#5a6a85] mb-4">{apiActual.descripcion}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#5a6a85]">
                <div className="flex items-center">
                  <span className="font-semibold mr-1">Tipo:</span> {apiActual.tipo}
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">Consultas:</span> {apiActual.consultas.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">Tiempo de respuesta:</span> 
                  {apiActual.tiempoRespuesta >= 1000 
                    ? `${(apiActual.tiempoRespuesta/1000).toFixed(3)} seg` 
                    : `${apiActual.tiempoRespuesta} ms`}
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">Fecha de creación:</span> {apiActual.fechaCreacion}
                </div>
              </div>
            </div>
            
            {/* Pestañas */}
            <div className="flex border-b border-[#eaeef3] overflow-x-auto">
              <button 
                className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'documentacion'
                    ? 'border-[#4a90e2] text-[#4a90e2]'
                    : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                }`}
                onClick={() => setActiveTab('documentacion')}
              >
                Documentación
              </button>
              <button 
                className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'ejemplos'
                    ? 'border-[#4a90e2] text-[#4a90e2]'
                    : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                }`}
                onClick={() => setActiveTab('ejemplos')}
              >
                Ejemplos
              </button>
              <button 
                className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'precios'
                    ? 'border-[#4a90e2] text-[#4a90e2]'
                    : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                }`}
                onClick={() => setActiveTab('precios')}
              >
                Precios
              </button>
              <button 
                className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'metricas'
                    ? 'border-[#4a90e2] text-[#4a90e2]'
                    : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                }`}
                onClick={() => setActiveTab('metricas')}
              >
                Métricas
              </button>
            </div>
            
            {/* Contenido de la pestaña activa */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#2c3e50]">
                  {activeTab === 'documentacion' && 'Documentación Técnica'}
                  {activeTab === 'ejemplos' && 'Ejemplos de Implementación'}
                  {activeTab === 'precios' && 'Planes y Precios'}
                  {activeTab === 'metricas' && 'Métricas de Rendimiento'}
                </h2>
                
                {activeTab === 'documentacion' && (
                  <button 
                    className="flex items-center px-4 py-2 border border-[#dbe0e8] rounded-md bg-white text-[#5a6a85] hover:bg-gray-50 text-sm"
                    onClick={handleExportPDF}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar PDF
                  </button>
                )}
              </div>
              
              {/* Contenido detallado de la API */}
              <ApiDetailContent api={apiActual} activeTab={activeTab} />
              
              {/* Botones de acción (contratar servicio) */}
              <div className="mt-10 pt-6 border-t border-[#eaeef3] flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-[#4a90e2] hover:bg-[#3a7bc8] text-white rounded-md transition duration-300">
                  Contratar Servicio
                </button>
                <button className="px-6 py-3 bg-white border border-[#4a90e2] text-[#4a90e2] hover:bg-[#f8fafc] rounded-md transition duration-300">
                  Solicitar Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDetail;