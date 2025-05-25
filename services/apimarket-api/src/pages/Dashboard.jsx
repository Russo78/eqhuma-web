import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import DashboardStats from '../components/DashboardStats';
import { useAuth } from '../context/AuthContext';
import { obtenerEstadisticasUso } from '../services/api';
import { exportarEstadisticasExcel, descargarArchivo } from '../utils/exportUtils';

/**
 * Página del Dashboard del usuario
 * Muestra estadísticas de uso, gráficos y gestión de API keys
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const estadisticas = await obtenerEstadisticasUso();
        setStats(estadisticas);
      } catch (err) {
        setError('Error al cargar las estadísticas de uso');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  /**
   * Maneja la exportación de estadísticas a Excel
   */
  const handleExportExcel = () => {
    if (stats) {
      const excelBlob = exportarEstadisticasExcel(stats);
      descargarArchivo(excelBlob, 'Estadisticas_eqhuma', 'xlsx');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabecera del Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2c3e50]">Dashboard</h1>
            <p className="text-[#5a6a85] mt-1">
              Bienvenido, {user?.nombre || 'Usuario'} - Resumen de uso de APIs
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative text-sm">
              <select 
                className="appearance-none px-4 py-2 pr-8 border border-[#dbe0e8] rounded-md bg-white text-[#5a6a85] focus:outline-none focus:border-[#4a90e2] cursor-pointer"
                defaultValue="30d"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="year">Último año</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button 
              className="flex items-center px-4 py-2 border border-[#dbe0e8] rounded-md bg-white text-[#5a6a85] hover:bg-gray-50 text-sm"
              onClick={handleExportExcel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </button>
          </div>
        </div>
        
        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#4a90e2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg text-[#4a90e2]">Cargando estadísticas...</span>
          </div>
        )}
        
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Tabs de navegación */}
        {!loading && stats && (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="flex border-b border-[#eaeef3] overflow-x-auto">
                <button 
                  className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === 'general'
                      ? 'border-[#4a90e2] text-[#4a90e2]'
                      : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  Estadísticas Generales
                </button>
                <button 
                  className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === 'apis'
                      ? 'border-[#4a90e2] text-[#4a90e2]'
                      : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                  }`}
                  onClick={() => setActiveTab('apis')}
                >
                  APIs Utilizadas
                </button>
                <button 
                  className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === 'keys'
                      ? 'border-[#4a90e2] text-[#4a90e2]'
                      : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                  }`}
                  onClick={() => setActiveTab('keys')}
                >
                  Gestión de API Keys
                </button>
                <button 
                  className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === 'suscripcion'
                      ? 'border-[#4a90e2] text-[#4a90e2]'
                      : 'border-transparent text-[#5a6a85] hover:text-[#2c3e50]'
                  }`}
                  onClick={() => setActiveTab('suscripcion')}
                >
                  Mi Suscripción
                </button>
              </div>
              
              {/* Contenido de la pestaña activa */}
              <div className="p-6">
                <DashboardStats stats={stats} activeTab={activeTab} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;