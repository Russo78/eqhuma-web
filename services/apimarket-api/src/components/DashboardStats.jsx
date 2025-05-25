import React, { useState } from 'react';

/**
 * Componente para mostrar estadísticas en el dashboard del usuario
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.stats - Datos de estadísticas
 * @param {string} props.activeTab - Pestaña activa ('general', 'apis', 'keys', 'suscripcion')
 */
const DashboardStats = ({ stats, activeTab }) => {
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  
  if (!stats) return null;

  /**
   * Renderiza el contenido de la pestaña general
   */
const renderGeneralTab = () => (
  <div className="space-y-6">
    {/* Tarjetas de estadísticas */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-[#5a6a85] mb-1">Consultas Totales</h3>
        <p className="text-2xl font-bold text-[#2c3e50]">{stats.totalConsultas.toLocaleString()}</p>
        <div className="flex items-center mt-2 text-xs text-[#5a6a85]">
          <span className="text-green-500">+{Math.round((stats.consultasUltimoMes / stats.totalConsultas) * 100)}%</span>
          <span className="ml-1">vs. mes anterior</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-[#5a6a85] mb-1">Consultas Último Mes</h3>
        <p className="text-2xl font-bold text-[#2c3e50]">{stats.consultasUltimoMes.toLocaleString()}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-[#5a6a85] mb-1">Tiempo Promedio</h3>
        <p className="text-2xl font-bold text-[#2c3e50]">{stats.tiempoPromedioRespuesta} ms</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-[#5a6a85] mb-1">Tasa de Éxito</h3>
        <p className="text-2xl font-bold text-[#2c3e50]">{stats.tasaExito}%</p>
      </div>
    </div>

    {/* Gráfico de uso */}
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-[#2c3e50] mb-4">Historial de Consultas</h3>
      <div className="h-64 bg-[#f8fafc] rounded-lg p-4 flex items-end">
        <div className="flex-1 h-48 flex items-end justify-around">
          {stats.historialConsultas.map((item, index) => {
            // Calcular altura relativa basada en el valor máximo
            const maxConsultas = Math.max(...stats.historialConsultas.map(i => i.consultas));
            const altura = Math.max(5, (item.consultas / maxConsultas) * 100);
            
            return (
              <div 
                key={index} 
                className="group relative"
              >
                <div 
                  style={{height: `${altura}%`}} 
                  className="w-8 bg-[#4a90e2] rounded-t hover:bg-[#3a7bc8] transition-all duration-200"
                ></div>
                
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-[#2c3e50] text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity duration-200">
                  {item.fecha}: {item.consultas.toLocaleString()} consultas
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between text-xs text-[#5a6a85] mt-2 overflow-x-auto">
        {stats.historialConsultas.map((item, index) => (
          <span key={index} className="px-1">{item.fecha}</span>
        ))}
      </div>
    </div>

    {/* Uso de cuota */}
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-[#2c3e50]">Uso de Cuota</h3>
        <span className="text-sm text-[#5a6a85]">
          {Math.round(stats.cuotaUtilizada)}% utilizado
        </span>
      </div>
      
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-[#e8f4fd]">
          <div 
            style={{ width: `${stats.cuotaUtilizada}%` }} 
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${stats.cuotaUtilizada > 90 ? 'bg-red-500' : 'bg-[#4a90e2]'}`}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

  /**
   * Renderiza el contenido de la pestaña de APIs
   */
  const renderApisTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-[#2c3e50] mb-4">APIs Más Utilizadas</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#eaeef3]">
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">API</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Consultas</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">% del Total</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stats.apiFavoritas && stats.apiFavoritas.map((api, index) => (
                <tr key={index} className="border-b border-[#eaeef3]">
                  <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">{api.nombre}</td>
                  <td className="py-3 px-4 text-sm text-[#5a6a85]">{api.consultas.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-[#5a6a85]">
                    {Math.round((api.consultas / stats.totalConsultas) * 100)}%
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <button className="text-[#4a90e2] hover:text-[#3a7bc8]">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza el contenido de la pestaña de API Keys
   */
  const renderKeysTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[#2c3e50]">Tus API Keys</h3>
          
          <button className="flex items-center px-4 py-2 bg-[#4a90e2] hover:bg-[#3a7bc8] text-white text-sm rounded-md transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Nueva Key
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#eaeef3]">
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Nombre</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Expiración</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stats.apiKeys && stats.apiKeys.map((key, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-[#eaeef3] ${selectedApiKey === key.id ? 'bg-[#f8fafc]' : ''}`}
                >
                  <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">{key.nombre}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${key.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {key.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#5a6a85]">{key.expiracion}</td>
                  <td className="py-3 px-4 text-sm space-x-2">
                    <button 
                      className="text-[#5a6a85] hover:text-[#2c3e50]"
                      onClick={() => setSelectedApiKey(selectedApiKey === key.id ? null : key.id)}
                    >
                      Ver
                    </button>
                    <button className="text-[#4a90e2] hover:text-[#3a7bc8]">
                      Rotar
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      Revocar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza el contenido de la pestaña de suscripción
   */
  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium text-[#2c3e50]">Tu Plan Actual</h3>
            <p className="text-[#5a6a85] mt-1">Plan Básico</p>
          </div>
          
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Activo
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-[#5a6a85] mb-1">Precio</p>
            <p className="text-xl font-bold text-[#2c3e50]">$29.00 <span className="text-sm font-normal text-[#5a6a85]">/ mes</span></p>
          </div>
          
          <div>
            <p className="text-sm text-[#5a6a85] mb-1">Consultas incluidas</p>
            <p className="text-xl font-bold text-[#2c3e50]">1,000 <span className="text-sm font-normal text-[#5a6a85]">/ mes</span></p>
          </div>
          
          <div>
            <p className="text-sm text-[#5a6a85] mb-1">Próxima facturación</p>
            <p className="text-xl font-bold text-[#2c3e50]">15/06/2023</p>
          </div>
        </div>
        
        <div className="border-t border-[#eaeef3] mt-6 pt-6">
          <h4 className="text-md font-medium text-[#2c3e50] mb-3">Características del plan</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>1,000 consultas mensuales</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Soporte por email</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Acceso a todas las APIs</span>
            </li>
          </ul>
        </div>
        
        <div className="border-t border-[#eaeef3] mt-6 pt-6 flex flex-wrap gap-4">
          <button className="px-6 py-2 bg-[#4a90e2] hover:bg-[#3a7bc8] text-white rounded-md transition duration-300">
            Actualizar Plan
          </button>
          <button className="px-6 py-2 bg-white border border-[#5a6a85] text-[#5a6a85] hover:bg-gray-50 rounded-md transition duration-300">
            Ver Historial de Facturación
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar el contenido según la pestaña activa
  return (
    <div>
      {activeTab === 'general' && renderGeneralTab()}
      {activeTab === 'apis' && renderApisTab()}
      {activeTab === 'keys' && renderKeysTab()}
      {activeTab === 'suscripcion' && renderSubscriptionTab()}
    </div>
  );
};

export default DashboardStats;
