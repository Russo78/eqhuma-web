import React, { createContext, useContext, useState } from 'react';
import { obtenerApis, buscarApiPorId, buscarApiPorTermino } from '../services/api';

// Crear el contexto de datos de API
const ApiDataContext = createContext();

/**
 * Hook personalizado para usar el contexto de datos de API
 */
export const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error('useApiData debe ser usado dentro de un ApiDataProvider');
  }
  return context;
};

/**
 * Provider para el contexto de datos de API
 */
export const ApiDataProvider = ({ children }) => {
  const [apis, setApis] = useState([]);
  const [apiActual, setApiActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalApis, setTotalApis] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  /**
   * Carga todas las APIs disponibles con opciones de paginación
   * @param {number} pagina - Número de página
   * @param {number} porPagina - Cantidad de APIs por página
   */
  const cargarApis = async (pagina = 1, porPagina = 6) => {
    try {
      setLoading(true);
      setError(null);
      
      const { apis, total, totalPaginas } = await obtenerApis(pagina, porPagina);
      
      setApis(apis);
      setTotalApis(total);
      setTotalPaginas(totalPaginas);
      setPaginaActual(pagina);
      
      return apis;
    } catch (err) {
      console.error('Error al cargar APIs:', err);
      setError(err.message || 'Error al cargar APIs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca APIs según filtros y términos de búsqueda
   * @param {string} termino - Término para búsqueda
   * @param {string} institucion - Filtrar por institución
   * @param {string} tipo - Filtrar por tipo de API
   * @param {string} ordenarPor - Criterio de ordenamiento
   * @param {number} pagina - Número de página
   * @param {number} porPagina - Cantidad de APIs por página
   */
  const buscarApis = async (
    termino = '', 
    institucion = '', 
    tipo = '', 
    ordenarPor = 'popular', 
    pagina = 1, 
    porPagina = 6
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const { apis, total, totalPaginas } = await buscarApiPorTermino(
        termino, 
        institucion, 
        tipo, 
        ordenarPor, 
        pagina, 
        porPagina
      );
      
      setApis(apis);
      setTotalApis(total);
      setTotalPaginas(totalPaginas);
      setPaginaActual(pagina);
      
      return apis;
    } catch (err) {
      console.error('Error al buscar APIs:', err);
      setError(err.message || 'Error al buscar APIs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene detalles de una API específica por su ID
   * @param {string} id - ID de la API a consultar
   */
  const obtenerDetalleApi = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = await buscarApiPorId(id);
      setApiActual(api);
      
      return api;
    } catch (err) {
      console.error(`Error al obtener detalles de API ${id}:`, err);
      setError(err.message || 'Error al obtener detalles de la API');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Avanza a la siguiente página
   */
  const siguientePagina = () => {
    if (paginaActual < totalPaginas) {
      cargarApis(paginaActual + 1);
    }
  };

  /**
   * Retrocede a la página anterior
   */
  const paginaAnterior = () => {
    if (paginaActual > 1) {
      cargarApis(paginaActual - 1);
    }
  };

  /**
   * Objeto de contexto con valores y funciones para gestionar los datos de APIs
   */
  const contextValue = {
    apis,
    apiActual,
    loading,
    error,
    totalApis,
    paginaActual,
    totalPaginas,
    cargarApis,
    buscarApis,
    obtenerDetalleApi,
    siguientePagina,
    paginaAnterior
  };

  return (
    <ApiDataContext.Provider value={contextValue}>
      {children}
    </ApiDataContext.Provider>
  );
};