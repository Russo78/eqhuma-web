import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente Header para la navegación principal del microservicio eqhuma
 * Muestra el logo, opciones de navegación y el menú de usuario
 */
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Navega al marketplace (página principal)
   */
  const irAlMarketplace = () => {
    navigate('/');
  };

  /**
   * Navega al dashboard del usuario
   */
  const irAlDashboard = () => {
    navigate('/dashboard');
  };

  /**
   * Navega a la documentación técnica
   */
  const irADocumentacion = () => {
    navigate('/documentation');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <div 
              className="text-2xl font-bold text-[#2c3e50] cursor-pointer flex items-center" 
              onClick={irAlMarketplace}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 mr-2 text-[#4a90e2]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
              eqhuma
            </div>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={irAlMarketplace}
              className="text-[#5a6a85] hover:text-[#4a90e2] px-3 py-2 text-sm font-medium"
            >
              Marketplace
            </button>
            <button
              onClick={irADocumentacion}
              className="text-[#5a6a85] hover:text-[#4a90e2] px-3 py-2 text-sm font-medium"
            >
              Documentación
            </button>
            <button
              onClick={irAlDashboard}
              className="text-[#5a6a85] hover:text-[#4a90e2] px-3 py-2 text-sm font-medium"
            >
              Mi Dashboard
            </button>
          </nav>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-4">
            <span className="text-[#5a6a85] text-sm hidden md:block">
              Bienvenido, {user?.nombre || 'Usuario'}
            </span>
            <div className="relative group">
              <button className="flex items-center focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-[#4a90e2] flex items-center justify-center text-white">
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
              <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                <div className="py-2">
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mi Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-between px-4">
          <button
            onClick={irAlMarketplace}
            className="flex-1 text-center py-2 text-[#5a6a85] hover:text-[#4a90e2] text-sm font-medium"
          >
            Marketplace
          </button>
          <button
            onClick={irADocumentacion}
            className="flex-1 text-center py-2 text-[#5a6a85] hover:text-[#4a90e2] text-sm font-medium"
          >
            Docs
          </button>
          <button
            onClick={irAlDashboard}
            className="flex-1 text-center py-2 text-[#5a6a85] hover:text-[#4a90e2] text-sm font-medium"
          >
            Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;