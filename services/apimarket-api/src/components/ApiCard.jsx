// src/components/ApiCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de tarjeta para mostrar información resumida de una API
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.api - Objeto con información de la API
 * @param {Function} props.onClick - Función opcional para manejo personalizado de clic
 */
const ApiCard = ({ api, onClick }) => {
  const navigate = useNavigate();

  /**
   * Formatea el tiempo de respuesta para mostrar ms o segundos
   * @param {number} tiempo - Tiempo en milisegundos
   * @returns {string} - Tiempo formateado
   */
  const formatearTiempoRespuesta = (tiempo) => {
    if (tiempo >= 1000) {
      return `${(tiempo / 1000).toFixed(3)} seg`;
    }
    return `${tiempo} ms`;
  };

  /**
   * Maneja el clic en la tarjeta de API
   */
  const handleClick = () => {
    if (onClick) {
      onClick(api);
    } else {
      navigate(`/api/${api.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <div className="bg-[#f8fafc] p-4 border-b border-[#eaeef3]">
        <span className="inline-block px-2 py-1 bg-[#e8f4fd] text-[#4a90e2] text-xs font-semibold rounded mb-2">
          {api.institucion}
        </span>
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-1 line-clamp-2">
          {api.nombre}
        </h3>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-[#5a6a85] mb-4 line-clamp-3">
          {api.descripcion}
        </p>
      </div>
      
      <div className="p-4 border-t border-[#eaeef3] flex justify-between items-center">
        <div className="flex gap-4 text-xs text-[#5a6a85]">
          <span title="Total de consultas">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-[#4a90e2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {api.consultas.toLocaleString()}
          </span>
          
          <span title="Tiempo de respuesta promedio">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-[#4a90e2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatearTiempoRespuesta(api.tiempoRespuesta)}
          </span>
        </div>
        <button className="px-3 py-1 text-sm bg-[#4a90e2] hover:bg-[#3a7bc8] text-white rounded transition duration-300">
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default ApiCard;