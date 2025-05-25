import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginService, validarToken, obtenerUsuario } from '../services/auth';

// Crear el contexto de autenticación
const AuthContext = createContext();

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

/**
 * Provider para el contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const verificarAutenticacion = async () => {
      const token = localStorage.getItem('eqhuma_token');
      
      if (token) {
        try {
          const isValid = await validarToken(token);
          
          if (isValid) {
            const userData = await obtenerUsuario();
            setUser(userData);
          } else {
            // Token inválido, eliminar del localStorage
            localStorage.removeItem('eqhuma_token');
          }
        } catch (err) {
          console.error('Error al verificar autenticación:', err);
          setError('Error al verificar autenticación');
          localStorage.removeItem('eqhuma_token');
        }
      }
      
      setLoading(false);
    };

    verificarAutenticacion();
  }, []);

  /**
   * Función para iniciar sesión
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @param {boolean} remember - Opción para recordar las credenciales
   */
  const login = async (email, password, remember = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamada al servicio de autenticación
      const { token, userData } = await loginService(email, password);
      
      // Guardar token en localStorage si se logró autenticar
      localStorage.setItem('eqhuma_token', token);
      
      // Guardar el usuario en el estado
      setUser(userData);
      
      return userData;
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   */
  const logout = () => {
    localStorage.removeItem('eqhuma_token');
    setUser(null);
  };

  /**
   * Objeto de contexto con valores y funciones para gestionar la autenticación
   */
  const contextValue = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};