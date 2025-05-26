"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Definir los tipos para el usuario y la sesión
export interface User {
  id: string;
  name: string;
  email: string;
  role: "socio" | "admin" | "cliente";
}

export interface Session {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Funciones de autenticación
interface AuthContextType extends Session {
  login: (email: string, password: string, userType?: "cliente" | "admin" | "socio") => Promise<void>;
  logout: () => void;
}

// Valor inicial del contexto
const initialState: Session = {
  user: null,
  isLoading: true,
  error: null,
};

// Crear el contexto
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  logout: () => {},
});

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(initialState);

  // Verificar si hay una sesión almacenada al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // En un sitio estático, usamos localStorage para simular la sesión
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setSession({
            user: JSON.parse(storedUser),
            isLoading: false,
            error: null,
          });
        } else {
          setSession({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setSession({
          user: null,
          isLoading: false,
          error: "Error al cargar la sesión",
        });
      }
    };

    checkSession();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string, userType: "cliente" | "admin" | "socio" = "socio") => {
    try {
      setSession({ ...session, isLoading: true, error: null });

      // En una aplicación real, aquí harías una llamada a la API
      // Para este ejemplo, simulamos una respuesta de API

      // Credenciales de demostración para cada tipo de usuario
      const validCredentials = {
        cliente: { email: "cliente@eqhuma.com", password: "password", name: "Usuario Cliente" },
        admin: { email: "admin@eqhuma.com", password: "password", name: "Usuario Administrador" },
        socio: { email: "socio@eqhuma.com", password: "password", name: "Usuario Socio" },
      };

      // Verificar credenciales según el tipo de usuario
      const credentials = validCredentials[userType];
      
      if (!credentials) {
        throw new Error(`Tipo de usuario '${userType}' no válido`);
      }
      
      // For demo purposes, also accept any email containing the role name with password "password"
      if ((email === credentials.email && password === credentials.password) ||
          (password === "password" && email.toLowerCase().includes(userType.toLowerCase()))) {
        let userName = credentials.name;
        // If using an alternative email (not the predefined ones), use the email name as user name
        if (email !== credentials.email) {
          userName = email.split('@')[0];
        }
        
        const user: User = {
          id: `${userType}-123456`,
          name: userName,
          email: email,
          role: userType,
        };

        // Guardar en localStorage
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.error("Error guardando en localStorage:", e);
          // Continuar incluso si localStorage falla
        }

        setSession({
          user,
          isLoading: false,
          error: null,
        });
        return; // Exit function successfully
      } else {
        throw new Error("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Login error:", error);
      setSession({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
      throw error; // Re-throw to let the login component know there was an error
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("user");
    setSession({
      user: null,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
