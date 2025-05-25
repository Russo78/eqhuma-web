// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de formulario de inicio de sesión
 * Permite a los usuarios autenticarse en el sistema eqhuma
 */
const LoginForm = () => {
  // Estados para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  // Estados para manejo de errores y carga
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Hooks de navegación y autenticación
  const { login } = useAuth();
  const navigate = useNavigate();
  
  /**
   * Maneja el envío del formulario de inicio de sesión
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Intenta iniciar sesión con las credenciales proporcionadas
      await login(email, password, remember);
      navigate('/'); // Redirecciona al marketplace si es exitoso
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 text-[#4a90e2]" 
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
            </div>
            <h1 className="text-2xl font-bold text-[#2c3e50]">eqhuma</h1>
            <p className="text-sm text-[#5a6a85] mt-2">Inicia sesión para acceder a tu cuenta</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label 
                htmlFor="email" 
                className="block mb-2 text-sm font-medium text-[#5a6a85]"
              >
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico" 
                className="w-full px-4 py-3 border border-[#dbe0e8] rounded-md text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20"
                required 
              />
            </div>
            
            <div className="mb-5">
              <label 
                htmlFor="password" 
                className="block mb-2 text-sm font-medium text-[#5a6a85]"
              >
                Contraseña
              </label>
              <input 
                type="password" 
                id="password" 
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña" 
                className="w-full px-4 py-3 border border-[#dbe0e8] rounded-md text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20"
                required 
              />
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  name="remember" 
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-[#4a90e2] border-[#dbe0e8] rounded focus:ring-[#4a90e2]" 
                />
                <label 
                  htmlFor="remember" 
                  className="ml-2 text-sm text-[#5a6a85]"
                >
                  Recordarme
                </label>
              </div>
              <a 
                href="#" 
                className="text-sm text-[#4a90e2] hover:text-[#3a7bc8]"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            
            <button 
              type="submit" 
              className={`w-full py-3 px-4 bg-[#4a90e2] hover:bg-[#3a7bc8] text-white rounded-md transition duration-300 ease-in-out ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-[#5a6a85]">
            ¿No tienes una cuenta? 
            <a href="#" className="ml-1 text-[#4a90e2] hover:text-[#3a7bc8]">
              Regístrate
            </a>
          </div>
          
          <div className="mt-8 pt-5 border-t border-[#eaeef3] text-xs text-center text-[#5a6a85]">
            Al continuar, aceptas los 
            <a href="#" className="text-[#4a90e2] hover:text-[#3a7bc8]"> Términos de Servicio </a> 
            y la 
            <a href="#" className="text-[#4a90e2] hover:text-[#3a7bc8]"> Política de Privacidad</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;