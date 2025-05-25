import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

/**
 * Página de documentación de la plataforma eqhuma
 * Proporciona guías, tutoriales y referencias para el uso de las APIs
 */
const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);

  // Scrollea al inicio cuando cambia la sección activa
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  /**
   * Maneja el cambio en el campo de búsqueda
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Alterna la visibilidad de una pregunta frecuente
   */
  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  /**
   * Lista de preguntas frecuentes
   */
  const faqs = [
    {
      question: '¿Cómo obtener mi API key?',
      answer: 'Las API keys se generan automáticamente al registrarse en la plataforma. Puedes administrar tus keys desde la sección "Gestión de API Keys" en el Dashboard.'
    },
    {
      question: '¿Cómo se facturan los servicios?',
      answer: 'La facturación se realiza mensualmente según el plan contratado. Se aplican cargos adicionales si se excede el límite de consultas incluidas en el plan. Para más detalles, consulta la sección "Mi Suscripción" en el Dashboard.'
    },
    {
      question: '¿Cómo reportar un problema técnico?',
      answer: 'Para reportar problemas técnicos, utiliza nuestro sistema de tickets en el apartado de "Soporte" o escribe directamente a soporte@eqhuma.mx. Incluye información detallada sobre el problema para agilizar su resolución.'
    },
    {
      question: '¿Qué métodos de autenticación se soportan?',
      answer: 'eqhuma soporta autenticación basada en API Keys como método principal. También ofrecemos autenticación OAuth2 para clientes empresariales en planes específicos.'
    },
    {
      question: '¿Las APIs tienen límites de uso?',
      answer: 'Sí, cada API tiene límites de uso según el plan contratado. Estos límites incluyen número máximo de consultas por mes y tasas máximas por minuto. Los detalles se encuentran en la documentación específica de cada API.'
    }
  ];


  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabecera */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">Documentación</h1>
          <p className="text-[#5a6a85]">
            Todo lo que necesitas saber para comenzar a utilizar eqhuma
          </p>
        </div>
        
        {/* Buscador */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar en la documentación..."
              className="pl-10 w-full border border-[#dbe0e8] rounded-md py-2 focus:outline-none focus:ring-1 focus:ring-[#4a90e2] focus:border-[#4a90e2]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Barra lateral de navegación */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <h2 className="text-lg font-semibold text-[#2c3e50] mb-4">Contenido</h2>
              <nav className="space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'overview' ? 'bg-[#e8f4fd] text-[#4a90e2] font-medium' : 'text-[#5a6a85] hover:bg-gray-50'}`}
                  onClick={() => setActiveSection('overview')}
                >
                  Descripción general
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'getting-started' ? 'bg-[#e8f4fd] text-[#4a90e2] font-medium' : 'text-[#5a6a85] hover:bg-gray-50'}`}
                  onClick={() => setActiveSection('getting-started')}
                >
                  Primeros pasos
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'authentication' ? 'bg-[#e8f4fd] text-[#4a90e2] font-medium' : 'text-[#5a6a85] hover:bg-gray-50'}`}
                  onClick={() => setActiveSection('authentication')}
                >
                  Autenticación
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'error-handling' ? 'bg-[#e8f4fd] text-[#4a90e2] font-medium' : 'text-[#5a6a85] hover:bg-gray-50'}`}
                  onClick={() => setActiveSection('error-handling')}
                >
                  Manejo de errores
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'best-practices' ? 'bg-[#e8f4fd] text-[#4a90e2] font-medium' : 'text-[#5a6a85] hover:bg-gray-50'}`}
                  onClick={() => setActiveSection('best-practices')}
                >
                  Mejores prácticas
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'faq' ? 'bg-[#e8f4fd] text-[#4a90e2] font-medium' : 'text-[#5a6a85] hover:bg-gray-50'}`}
                  onClick={() => setActiveSection('faq')}
                >
                  Preguntas frecuentes
                </button>
              </nav>
            </div>
          </div>

          
          {/* Contenido de la sección activa */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Descripción general */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Descripción general</h2>
                  
                  <p className="text-[#5a6a85]">
                    eqhuma es una plataforma que facilita el acceso a diversas APIs de servicios gubernamentales y privados en México. 
                    Nuestra plataforma simplifica la integración, proporciona documentación detallada y ofrece herramientas para monitorear el uso de las APIs.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-[#f8fafc] p-5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4a90e2] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="text-lg font-medium text-[#2c3e50] mb-2">Acceso Seguro</h3>
                      <p className="text-sm text-[#5a6a85]">
                        Todas las APIs utilizan protocolos de seguridad estándar de la industria para garantizar la protección de los datos.
                      </p>
                    </div>
                    
                    <div className="bg-[#f8fafc] p-5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4a90e2] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-lg font-medium text-[#2c3e50] mb-2">Alto Rendimiento</h3>
                      <p className="text-sm text-[#5a6a85]">
                        Nuestras APIs están optimizadas para proporcionar respuestas rápidas y confiables, minimizando la latencia.
                      </p>
                    </div>
                    
                    <div className="bg-[#f8fafc] p-5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4a90e2] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-[#2c3e50] mb-2">Documentación Clara</h3>
                      <p className="text-sm text-[#5a6a85]">
                        Ofrecemos documentación completa y ejemplos de código para facilitar la integración en diferentes lenguajes de programación.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">APIs Disponibles</h3>
                    <p className="text-[#5a6a85] mb-4">
                      eqhuma ofrece acceso a una amplia variedad de APIs gubernamentales y privadas, incluyendo pero no limitado a:
                    </p>
                    
                    <ul className="list-disc pl-6 space-y-2 text-[#5a6a85]">
                      <li>Consulta de datos del IMSS (semanas cotizadas, historial laboral)</li>
                      <li>Verificación de comprobantes fiscales (SAT)</li>
                      <li>Consulta de información del Registro Público de la Propiedad</li>
                      <li>Validación de identidad</li>
                      <li>Consulta de información crediticia</li>
                      <li>Y muchas más...</li>
                    </ul>
                  </div>
                </div>
              )}

              
              {/* Primeros pasos */}
              {activeSection === 'getting-started' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Primeros pasos</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">1. Crear una cuenta</h3>
                      <p className="text-[#5a6a85] mb-3">
                        Para comenzar a utilizar eqhuma, necesitas crear una cuenta. El proceso es simple y rápido:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2 text-[#5a6a85]">
                        <li>Visita la página de <Link to="/login" className="text-[#4a90e2] hover:underline">registro</Link>.</li>
                        <li>Completa el formulario con tus datos personales y de la empresa.</li>
                        <li>Verifica tu correo electrónico haciendo clic en el enlace que te enviamos.</li>
                        <li>Establece tu contraseña.</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">2. Elegir un plan</h3>
                      <p className="text-[#5a6a85] mb-3">
                        Ofrecemos diferentes planes según tus necesidades de consumo:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-[#5a6a85]">
                        <li><span className="font-medium">Plan Básico:</span> Ideal para pequeñas empresas o desarrolladores individuales.</li>
                        <li><span className="font-medium">Plan Profesional:</span> Para empresas medianas con necesidades moderadas de consultas.</li>
                        <li><span className="font-medium">Plan Empresarial:</span> Diseñado para grandes volúmenes de consultas y características avanzadas.</li>
                      </ul>
                      <p className="text-[#5a6a85] mt-3">
                        También ofrecemos planes personalizados para necesidades específicas. 
                        <Link to="/" className="text-[#4a90e2] hover:underline ml-1">Contacta con nuestro equipo comercial</Link> para más información.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">3. Generar API Keys</h3>
                      <p className="text-[#5a6a85] mb-3">
                        Una vez que hayas elegido un plan, necesitarás generar una API Key para comenzar a hacer solicitudes:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2 text-[#5a6a85]">
                        <li>Accede a tu <Link to="/dashboard" className="text-[#4a90e2] hover:underline">Dashboard</Link>.</li>
                        <li>Ve a la sección "Gestión de API Keys".</li>
                        <li>Haz clic en "Crear Nueva Key".</li>
                        <li>Asigna un nombre descriptivo a tu API Key.</li>
                        <li>Establece permisos y restricciones si es necesario.</li>
                        <li>Guarda de forma segura tu API Key, ya que no podrás verla completa nuevamente.</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">4. Hacer tu primera consulta</h3>
                      <p className="text-[#5a6a85] mb-3">
                        Con tu API Key generada, ya puedes hacer tu primera consulta:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2 text-[#5a6a85]">
                        <li>Explora el <Link to="/" className="text-[#4a90e2] hover:underline">Marketplace</Link> y elige la API que necesitas.</li>
                        <li>Revisa la documentación específica de la API seleccionada.</li>
                        <li>Utiliza los ejemplos de código proporcionados como guía.</li>
                        <li>Adapta el código a tu lenguaje de programación preferido.</li>
                        <li>Ejecuta la consulta y analiza los resultados.</li>
                      </ol>
                      
                      <div className="bg-[#f8fafc] p-5 rounded-lg mt-4">
                        <h4 className="text-lg font-medium text-[#2c3e50] mb-2">Ejemplo de consulta (JavaScript)</h4>
                        <pre className="bg-[#f1f5f9] p-4 rounded overflow-x-auto text-sm">
                          {`fetch('https://api.eqhuma.mx/v1/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'TU_API_KEY_AQUI'
  },
  body: JSON.stringify({
    // Parámetros específicos de la API
    parametro1: 'valor1',
    parametro2: 'valor2'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Respuesta:', data);
})
.catch(error => {
  console.error('Error:', error);
});`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              
              {/* Autenticación */}
              {activeSection === 'authentication' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Autenticación</h2>
                  
                  <p className="text-[#5a6a85]">
                    eqhuma utiliza un sistema de autenticación basado en API Keys para garantizar que solo los usuarios autorizados puedan acceder a los servicios.
                  </p>
                  
                  <div className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Tipos de autenticación</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-medium text-[#2c3e50] mb-2">API Key en Encabezado HTTP</h4>
                          <p className="text-[#5a6a85] mb-3">
                            El método recomendado es incluir tu API Key en el encabezado de la solicitud HTTP:
                          </p>
                          
                          <pre className="bg-[#f1f5f9] p-4 rounded overflow-x-auto text-sm">
                            {`X-API-Key: TU_API_KEY_AQUI`}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-[#2c3e50] mb-2">API Key como Parámetro de Consulta</h4>
                          <p className="text-[#5a6a85] mb-3">
                            En algunos casos, también puedes incluir tu API Key como un parámetro de consulta en la URL:
                          </p>
                          
                          <pre className="bg-[#f1f5f9] p-4 rounded overflow-x-auto text-sm">
                            {`https://api.eqhuma.mx/v1/endpoint?api_key=TU_API_KEY_AQUI`}
                          </pre>
                          
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  <strong>Precaución:</strong> Este método es menos seguro porque la API Key podría quedar registrada en logs de servidores o historiales de navegación.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Seguridad de las API Keys</h3>
                      
                      <p className="text-[#5a6a85] mb-3">
                        Es crucial mantener tus API Keys seguras para prevenir accesos no autorizados:
                      </p>
                      
                      <ul className="list-disc pl-6 space-y-2 text-[#5a6a85]">
                        <li>No incluyas API Keys directamente en el código fuente, especialmente en repositorios públicos.</li>
                        <li>Utiliza variables de entorno o sistemas de gestión de secretos.</li>
                        <li>Implementa restricciones por IP para limitar desde dónde se pueden usar tus keys.</li>
                        <li>Rota regularmente tus API Keys, especialmente si sospechas que han sido comprometidas.</li>
                        <li>Asigna permisos mínimos necesarios a cada API Key.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              
              {/* Manejo de errores */}
              {activeSection === 'error-handling' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Manejo de errores</h2>
                  
                  <p className="text-[#5a6a85]">
                    Para facilitar el manejo de errores, todas las APIs de eqhuma utilizan códigos de estado HTTP estándar y proporcionan respuestas de error estructuradas.
                  </p>
                  
                  <div className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Códigos de estado HTTP</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#eaeef3]">
                              <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Código</th>
                              <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Descripción</th>
                              <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Escenario común</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[#eaeef3]">
                              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">200 OK</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">La solicitud se completó con éxito</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Consulta procesada correctamente</td>
                            </tr>
                            <tr className="border-b border-[#eaeef3]">
                              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">400 Bad Request</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">La solicitud contiene errores</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Parámetros inválidos o faltantes</td>
                            </tr>
                            <tr className="border-b border-[#eaeef3]">
                              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">401 Unauthorized</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Fallo de autenticación</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">API Key inválida o expirada</td>
                            </tr>
                            <tr className="border-b border-[#eaeef3]">
                              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">403 Forbidden</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Sin permisos suficientes</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">API Key válida pero sin permisos para el recurso</td>
                            </tr>
                            <tr className="border-b border-[#eaeef3]">
                              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">404 Not Found</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Recurso no encontrado</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">El endpoint o recurso solicitado no existe</td>
                            </tr>
                            <tr className="border-b border-[#eaeef3]">
                              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">429 Too Many Requests</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Límite de tasa excedido</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Se han realizado demasiadas solicitudes en un período</td>
                            </tr>
                            <tr className="border-b border-[#eaeef3]">
                              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">500 Internal Server Error</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Error del servidor</td>
                              <td className="py-3 px-4 text-sm text-[#5a6a85]">Error inesperado en el servidor</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Estructura de respuestas de error</h3>
                      
                      <p className="text-[#5a6a85] mb-3">
                        Todas las respuestas de error siguen una estructura consistente para facilitar su procesamiento:
                      </p>
                      
                      <pre className="bg-[#f1f5f9] p-4 rounded overflow-x-auto text-sm mb-4">
                        {`{
  "error": {
    "codigo": "ERROR_CODE",
    "mensaje": "Descripción detallada del error",
    "detalles": [
      {
        "campo": "parametro_afectado",
        "mensaje": "Razón específica del error en este campo"
      }
    ]
  }
}`}
                      </pre>
                      
                      <p className="text-[#5a6a85]">
                        El objeto <code className="bg-gray-100 px-1 rounded text-[#4a90e2]">detalles</code> puede variar según el tipo de error y puede contener información adicional útil para depurar el problema.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Mejores prácticas para manejar errores</h3>
                      
                      <ul className="list-disc pl-6 space-y-2 text-[#5a6a85]">
                        <li>
                          <span className="font-medium">Implementa manejo de errores robusto:</span> Captura y procesa adecuadamente todos los errores posibles.
                        </li>
                        <li>
                          <span className="font-medium">Respeta los límites de tasa:</span> Implementa retroceso exponencial para errores 429.
                        </li>
                        <li>
                          <span className="font-medium">Verifica los campos obligatorios:</span> Asegúrate de que todos los parámetros requeridos estén presentes y sean válidos.
                        </li>
                        <li>
                          <span className="font-medium">Valida las respuestas:</span> No asumas que siempre recibirás una respuesta exitosa.
                        </li>
                        <li>
                          <span className="font-medium">Implementa registros de errores:</span> Guarda información detallada sobre los errores para futuras referencias.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              
              {/* Mejores prácticas */}
              {activeSection === 'best-practices' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Mejores prácticas</h2>
                  
                  <p className="text-[#5a6a85]">
                    Sigue estas mejores prácticas para optimizar tu experiencia con eqhuma y asegurar un uso eficiente de nuestras APIs.
                  </p>
                  
                  <div className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Optimización de rendimiento</h3>
                      
                      <ul className="list-disc pl-6 space-y-3 text-[#5a6a85]">
                        <li>
                          <span className="font-medium">Implementa caché:</span> Almacena en caché las respuestas que no cambian con frecuencia para reducir el número de llamadas a la API.
                        </li>
                        <li>
                          <span className="font-medium">Solicita solo lo necesario:</span> Algunas APIs permiten especificar los campos que necesitas. Utiliza estos parámetros para reducir el tamaño de las respuestas.
                        </li>
                        <li>
                          <span className="font-medium">Usa paginación:</span> Para endpoints que devuelven grandes conjuntos de datos, implementa paginación para procesar los resultados en lotes manejables.
                        </li>
                        <li>
                          <span className="font-medium">Procesa asincrónicamente:</span> Para consultas que toman tiempo, considera implementar un sistema de webhooks o polling para recibir los resultados.
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Seguridad</h3>
                      
                      <ul className="list-disc pl-6 space-y-3 text-[#5a6a85]">
                        <li>
                          <span className="font-medium">Protege tus API Keys:</span> Nunca incluyas tus API Keys en código del lado del cliente o repositorios públicos.
                        </li>
                        <li>
                          <span className="font-medium">Implementa SSL/TLS:</span> Asegúrate de que todas las comunicaciones con nuestra API utilicen HTTPS.
                        </li>
                        <li>
                          <span className="font-medium">Implementa registros de auditoría:</span> Mantén registros detallados de todas las llamadas a la API para detectar uso no autorizado.
                        </li>
                        <li>
                          <span className="font-medium">Verifica los datos de entrada:</span> Valida y sanitiza todos los datos que recibes de usuarios antes de enviarlos a la API.
                        </li>
                        <li>
                          <span className="font-medium">Utiliza permisos granulares:</span> Asigna a cada API Key solo los permisos mínimos necesarios para su función.
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Gestión de recursos</h3>
                      
                      <ul className="list-disc pl-6 space-y-3 text-[#5a6a85]">
                        <li>
                          <span className="font-medium">Monitorea tu uso:</span> Utiliza el Dashboard para monitorear tu consumo de APIs y evitar sorpresas en la facturación.
                        </li>
                        <li>
                          <span className="font-medium">Configura alertas:</span> Establece alertas de uso para recibir notificaciones cuando te acerques a tus límites.
                        </li>
                        <li>
                          <span className="font-medium">Implementa límites de tasa internos:</span> Establece límites de tasa en tu aplicación para asegurarte de no exceder los límites de la API.
                        </li>
                        <li>
                          <span className="font-medium">Distribuye la carga:</span> Para aplicaciones de alto volumen, distribuye las llamadas a la API uniformemente a lo largo del día para evitar picos.
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">Desarrollo y pruebas</h3>
                      
                      <ul className="list-disc pl-6 space-y-3 text-[#5a6a85]">
                        <li>
                          <span className="font-medium">Usa entornos de prueba:</span> Utiliza API Keys de desarrollo para pruebas y no mezcles con el entorno de producción.
                        </li>
                        <li>
                          <span className="font-medium">Automatiza pruebas:</span> Implementa pruebas automáticas para verificar que tus integraciones con la API funcionan correctamente.
                        </li>
                        <li>
                          <span className="font-medium">Mantente actualizado:</span> Suscríbete a nuestras notificaciones para estar al tanto de cambios en las APIs.
                        </li>
                        <li>
                          <span className="font-medium">Implementa control de versiones:</span> Diseña tu código para adaptarse fácilmente a nuevas versiones de la API.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              
              {/* Preguntas frecuentes */}
              {activeSection === 'faq' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Preguntas frecuentes</h2>
                  
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-[#eaeef3] rounded-lg overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-[#f8fafc] transition-colors duration-200"
                          onClick={() => toggleFaq(index)}
                        >
                          <h3 className="text-lg font-medium text-[#2c3e50]">{faq.question}</h3>
                          <svg
                            className={`h-5 w-5 text-[#4a90e2] transform ${activeFaq === index ? 'rotate-180' : ''} transition-transform duration-200`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {activeFaq === index && (
                          <div className="p-4 bg-[#f8fafc] border-t border-[#eaeef3]">
                            <p className="text-[#5a6a85]">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-[#f8fafc] rounded-lg border border-[#eaeef3]">
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">¿No encuentras lo que buscas?</h3>
                    <p className="text-[#5a6a85] mb-4">
                      Si tienes alguna pregunta que no ha sido respondida en esta sección, no dudes en ponerte en contacto con nuestro equipo de soporte.
                    </p>
                    <div className="flex space-x-4">
                      <button className="px-4 py-2 bg-[#4a90e2] text-white rounded-md hover:bg-[#3a7bc8] transition-colors duration-200">
                        Contactar soporte
                      </button>
                      <button className="px-4 py-2 border border-[#4a90e2] text-[#4a90e2] rounded-md hover:bg-[#e8f4fd] transition-colors duration-200">
                        Consultar guías
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Header />
    </div>
  );
};

export default Documentation;
