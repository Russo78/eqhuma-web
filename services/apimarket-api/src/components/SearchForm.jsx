// src/components/SearchForm.jsx
import React, { useState, useEffect } from 'react';
import { useApiData } from '../context/ApiDataContext';

/**
 * Componente de formulario de búsqueda para APIs en el marketplace
 * Permite filtrar por término de búsqueda, institución y tipo de API
 */
const SearchForm = () => {
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [tipoApi, setTipoApi] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('popular');
  
  // Contexto de datos de APIs
  const { buscarApis, loading } = useApiData();
  
  /**
   * Maneja la búsqueda al enviar el formulario
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    buscarApis(searchTerm, institucion, tipoApi, ordenarPor);
  };
  
  /**
   * Realiza una búsqueda inicial al cargar el componente
   */
  useEffect(() => {
    buscarApis('', '', '', 'popular');
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-medium text-[#2c3e50] mb-6">Buscar APIs</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input 
              type="text" 
              id="search" 
              name="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, funcionalidad o institución..." 
              className="w-full px-4 py-3 border border-[#dbe0e8] rounded-md text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20"
            />
          </div>
          <div>
            <button 
              type="submit" 
              className={`w-full md:w-auto px-6 py-3 bg-[#4a90e2] hover:bg-[#3a7bc8] text-white rounded-md transition duration-300 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label 
              htmlFor="institution" 
              className="block mb-2 text-sm font-medium text-[#5a6a85]"
            >
              Institución
            </label>
            <select 
              id="institution" 
              name="institution"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              className="w-full px-4 py-3 border border-[#dbe0e8] rounded-md text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20"
            >
              <option value="">Todas las instituciones</option>
              <option value="sat">SAT</option>
              <option value="imss">IMSS</option>
              <option value="renapo">RENAPO</option>
              <option value="infonavit">INFONAVIT</option>
              <option value="sep">SEP</option>
            </select>
          </div>
          
          <div>
            <label 
              htmlFor="type" 
              className="block mb-2 text-sm font-medium text-[#5a6a85]"
            >
              Tipo de API
            </label>
            <select 
              id="type" 
              name="type"
              value={tipoApi}
              onChange={(e) => setTipoApi(e.target.value)}
              className="w-full px-4 py-3 border border-[#dbe0e8] rounded-md text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20"
            >
              <option value="">Todos los tipos</option>
              <option value="default">Default</option>
              <option value="special">Special</option>
            </select>
          </div>
          
          <div>
            <label 
              htmlFor="sort" 
              className="block mb-2 text-sm font-medium text-[#5a6a85]"
            >
              Ordenar por
            </label>
            <select 
              id="sort" 
              name="sort"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="w-full px-4 py-3 border border-[#dbe0e8] rounded-md text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20"
            >
              <option value="popular">Popularidad</option>
              <option value="recent">Más recientes</option>
              <option value="response">Tiempo de respuesta</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;