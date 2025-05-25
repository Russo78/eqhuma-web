import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import SearchForm from '../components/SearchForm';
import ApiCard from '../components/ApiCard';
import { useApiData } from '../context/ApiDataContext';
import { exportarApisExcel, descargarArchivo } from '../utils/exportUtils';

/**
 * Página principal del marketplace de APIs
 * Muestra el formulario de búsqueda y los resultados en forma de tarjetas
 */
const Marketplace = () => {
  const { 
    apis, 
    loading, 
    error, 
    totalApis, 
    paginaActual, 
    totalPaginas, 
    cargarApis,
    siguientePagina, 
    paginaAnterior 
  } = useApiData();

  const [showExportOptions, setShowExportOptions] = useState(false);

  // Cargar APIs al montar el componente
  useEffect(() => {
    cargarApis();
  }, []);

  /**
   * Maneja la exportación de los datos de APIs a Excel
   */
  const handleExportExcel = () => {
    const excelBlob = exportarApisExcel(apis);
    descargarArchivo(excelBlob, 'APIs_eqhuma', 'xlsx');
    setShowExportOptions(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de búsqueda */}
        <SearchForm />
        
        {/* Encabezado de resultados */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2c3e50]">APIs Disponibles</h2>
          
          <div className="relative">
            <button 
              className="flex items-center px-4 py-2 border border-[#dbe0e8] rounded-md bg-white text-[#5a6a85] hover:bg-gray-50 text-sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Menú desplegable para opciones de exportación */}
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleExportExcel}
                  >
                    Exportar a Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Estado de carga */}
        {loading && apis.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#4a90e2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg text-[#4a90e2]">Cargando APIs...</span>
          </div>
        )}
        
        {/* Sin resultados */}
        {!loading && apis.length === 0 && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-500 mb-2">No se encontraron APIs</h3>
            <p className="text-gray-400">Intenta con diferentes criterios de búsqueda</p>
          </div>
        )}
        
        {/* Cuadrícula de APIs */}
        {!loading && apis.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {apis.map(api => (
                <ApiCard key={api.id} api={api} />
              ))}
            </div>
            
            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button 
                  onClick={paginaAnterior}
                  disabled={paginaActual <= 1}
                  className={`px-4 py-2 border border-[#dbe0e8] rounded-md text-sm 
                    ${paginaActual <= 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-[#5a6a85] hover:bg-gray-50'}
                  `}
                >
                  Anterior
                </button>
                
                <span className="text-sm text-[#5a6a85]">
                  Página {paginaActual} de {totalPaginas}
                </span>
                
                <button 
                  onClick={siguientePagina}
                  disabled={paginaActual >= totalPaginas}
                  className={`px-4 py-2 border border-[#dbe0e8] rounded-md text-sm
                    ${paginaActual >= totalPaginas 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-[#5a6a85] hover:bg-gray-50'}
                  `}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;