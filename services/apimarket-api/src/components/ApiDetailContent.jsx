import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Componente que muestra el contenido detallado de una API según la pestaña activa
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.api - Objeto con información completa de la API
 * @param {string} props.activeTab - Pestaña activa ('documentacion', 'ejemplos', 'precios', 'metricas')
 */
const ApiDetailContent = ({ api, activeTab }) => {
  if (!api) return null;

  // Ejemplos de código para implementación de la API
  const javaScriptCode = `// Ejemplo de consumo de la API ${api.nombre} con JavaScript
fetch('${api.url}', {
  method: '${api.metodo}',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'SU_API_KEY_AQUI'
  },
  body: JSON.stringify({
    ${api.parametros && api.parametros[0]?.nombre !== 'api_key' ? `${api.parametros[0]?.nombre}: 'valor_ejemplo'` : '// Parámetros de la petición'}
  })
})
.then(response => response.json())
.then(data => {
  console.log('Respuesta exitosa:', data);
})
.catch(error => {
  console.error('Error:', error);
});`;

  const pythonCode = `# Ejemplo de consumo de la API ${api.nombre} con Python
import requests
import json

url = "${api.url}"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "SU_API_KEY_AQUI"
}

payload = {
    ${api.parametros && api.parametros[0]?.nombre !== 'api_key' ? `"${api.parametros[0]?.nombre}": "valor_ejemplo"` : '# Parámetros de la petición'}
}

response = requests.${api.metodo.toLowerCase()}(url, headers=headers, data=json.dumps(payload))

if response.status_code == 200:
    data = response.json()
    print("Respuesta exitosa:", data)
else:
    print(f"Error {response.status_code}:", response.text)`;

  const phpCode = `<?php
// Ejemplo de consumo de la API ${api.nombre} con PHP
$url = '${api.url}';
$api_key = 'SU_API_KEY_AQUI';

$data = array(
    ${api.parametros && api.parametros[0]?.nombre !== 'api_key' ? `"${api.parametros[0]?.nombre}" => "valor_ejemplo"` : '// Parámetros de la petición'}
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\r\nX-API-Key: " . $api_key,
        'method'  => '${api.metodo}',
        'content' => json_encode($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result !== FALSE) {
    $response = json_decode($result, true);
    print_r($response);
} else {
    echo "Error al realizar la petición";
}
?>`;

  /**
   * Renderiza el contenido de la pestaña de documentación
   */
  const renderDocumentationTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Descripción General</h3>
        <p className="text-[#5a6a85] mb-4">{api.documentacion || api.descripcion}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Endpoint</h3>
        <div className="bg-[#f8fafc] p-4 rounded-md border border-[#eaeef3] font-mono text-sm overflow-x-auto">
          <div className="flex gap-2 items-center">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{api.metodo}</span>
            <span>{api.url}</span>
          </div>
        </div>
      </div>
      
      {api.parametros && api.parametros.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Parámetros</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#eaeef3]">
                  <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Nombre</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Tipo</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Requerido</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {api.parametros.map((param, index) => (
                  <tr key={index} className="border-b border-[#eaeef3]">
                    <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">{param.nombre}</td>
                    <td className="py-3 px-4 text-sm text-[#5a6a85]">{param.tipo}</td>
                    <td className="py-3 px-4 text-sm text-[#5a6a85]">{param.requerido ? 'Sí' : 'No'}</td>
                    <td className="py-3 px-4 text-sm text-[#5a6a85]">{param.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {api.respuestas && (
        <div>
          <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Ejemplos de Respuestas</h3>
          
          <div className="mb-4">
            <h4 className="text-md font-medium text-[#2c3e50] mb-2">Respuesta Exitosa (Código {api.respuestas.exito.codigo})</h4>
            <SyntaxHighlighter 
              language="json" 
              style={tomorrow} 
              customStyle={{borderRadius: '0.375rem'}}
              wrapLines={true}
            >
              {api.respuestas.exito.ejemplo}
            </SyntaxHighlighter>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-[#2c3e50] mb-2">Respuesta de Error (Código {api.respuestas.error.codigo})</h4>
            <SyntaxHighlighter 
              language="json" 
              style={tomorrow} 
              customStyle={{borderRadius: '0.375rem'}}
              wrapLines={true}
            >
              {api.respuestas.error.ejemplo}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
      
      {api.codigosEstado && api.codigosEstado.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Códigos de Estado</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#eaeef3]">
                  <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Código</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {api.codigosEstado.map((codigo, index) => (
                  <tr key={index} className="border-b border-[#eaeef3]">
                    <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">{codigo.codigo}</td>
                    <td className="py-3 px-4 text-sm text-[#5a6a85]">{codigo.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Renderiza el contenido de la pestaña de ejemplos de código
   */
  const renderExamplesTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">JavaScript (fetch)</h3>
        <SyntaxHighlighter 
          language="javascript" 
          style={tomorrow} 
          customStyle={{borderRadius: '0.375rem'}}
          wrapLines={true}
        >
          {javaScriptCode}
        </SyntaxHighlighter>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Python (requests)</h3>
        <SyntaxHighlighter 
          language="python" 
          style={tomorrow} 
          customStyle={{borderRadius: '0.375rem'}}
          wrapLines={true}
        >
          {pythonCode}
        </SyntaxHighlighter>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">PHP</h3>
        <SyntaxHighlighter 
          language="php" 
          style={tomorrow} 
          customStyle={{borderRadius: '0.375rem'}}
          wrapLines={true}
        >
          {phpCode}
        </SyntaxHighlighter>
      </div>
      
      <div className="rounded-md border border-[#dbe0e8] p-6 bg-[#f8fafc]">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Notas Importantes</h3>
        <ul className="list-disc pl-5 space-y-2 text-[#5a6a85]">
          <li>Reemplaza <code className="bg-gray-100 px-1 rounded text-[#4a90e2]">SU_API_KEY_AQUI</code> con tu clave de API.</li>
          <li>Maneja adecuadamente los errores en producción.</li>
          <li>No compartas tu clave de API en código del lado del cliente.</li>
          <li>Considera implementar un mecanismo de caché para optimizar el uso.</li>
        </ul>
      </div>
    </div>
  );

  /**
   * Renderiza el contenido de la pestaña de precios
   */
  const renderPricingTab = () => (
    <div className="space-y-6">
      {api.precios && api.precios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {api.precios.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg overflow-hidden border ${
                index === 1 
                  ? 'border-[#4a90e2] shadow-lg' 
                  : 'border-[#eaeef3]'
              }`}
            >
              <div className={`p-6 ${index === 1 ? 'bg-[#4a90e2] text-white' : 'bg-white'}`}>
                <h3 className="text-xl font-bold mb-2">{plan.plan}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold">${plan.precio}</span>
                  <span className="text-sm mb-1">/ consulta</span>
                </div>
                <p className={`text-sm ${index === 1 ? 'text-blue-100' : 'text-[#5a6a85]'}`}>
                  {plan.cuota}
                </p>
              </div>
              
              <div className="p-6 bg-white">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acceso a la API {api.nombre}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Soporte técnico por email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dashboard de análisis</span>
                  </li>
                  {index > 0 && (
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>SLA de disponibilidad 99.9%</span>
                    </li>
                  )}
                  {index > 1 && (
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Soporte prioritario 24/7</span>
                    </li>
                  )}
                </ul>
                <button className={`w-full py-2 px-4 rounded-md transition duration-300 ${
                  index === 1 
                    ? 'bg-[#4a90e2] hover:bg-[#3a7bc8] text-white' 
                    : 'border border-[#4a90e2] text-[#4a90e2] hover:bg-[#f8fafc]'
                }`}>
                  Seleccionar Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-[#5a6a85]">No hay información de precios disponible para esta API.</p>
        </div>
      )}

      <div className="rounded-md border border-[#dbe0e8] p-6 bg-[#f8fafc] mt-8">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Planes empresariales</h3>
        <p className="text-[#5a6a85] mb-4">
          ¿Necesitas un volumen mayor de consultas o características especiales?
          Ofrecemos planes personalizados para empresas con necesidades específicas.
        </p>
        <button className="px-6 py-2 bg-white border border-[#4a90e2] text-[#4a90e2] hover:bg-[#f1f5f9] rounded-md transition duration-300">
          Contactar para plan empresarial
        </button>
      </div>
    </div>
  );

  /**
   * Renderiza el contenido de la pestaña de métricas
   */
  const renderMetricsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#eaeef3] p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Métricas de Rendimiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f8fafc] p-4 rounded-lg">
            <p className="text-sm text-[#5a6a85] mb-1">Tiempo de respuesta promedio</p>
            <p className="text-2xl font-bold text-[#2c3e50]">
              {api.tiempoRespuesta >= 1000 
                ? `${(api.tiempoRespuesta/1000).toFixed(3)} seg` 
                : `${api.tiempoRespuesta} ms`}
            </p>
          </div>
          
          <div className="bg-[#f8fafc] p-4 rounded-lg">
            <p className="text-sm text-[#5a6a85] mb-1">Disponibilidad</p>
            <p className="text-2xl font-bold text-[#2c3e50]">99.9%</p>
          </div>
          
          <div className="bg-[#f8fafc] p-4 rounded-lg">
            <p className="text-sm text-[#5a6a85] mb-1">Tasa de éxito</p>
            <p className="text-2xl font-bold text-[#2c3e50]">99.7%</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-[#eaeef3] p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Estadísticas de Uso</h3>
        
        <div className="flex flex-col">
          <div>
            <h4 className="text-md font-medium text-[#2c3e50] mb-2">Total de consultas mensuales</h4>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-[#4a90e2]">
                    {api.consultas.toLocaleString()} consultas
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-[#e8f4fd]">
                <div style={{ width: '65%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#4a90e2]"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-[#2c3e50] mb-3">Tendencia de uso (últimos 6 meses)</h4>
            <div className="h-60 bg-[#f8fafc] rounded-lg p-4 flex items-end">
              {/* Barras del gráfico simulado */}
              <div className="flex-1 h-40 flex items-end justify-around">
                <div style={{height: '30%'}} className="w-5 bg-[#4a90e2] rounded-t"></div>
                <div style={{height: '50%'}} className="w-5 bg-[#4a90e2] rounded-t"></div>
                <div style={{height: '45%'}} className="w-5 bg-[#4a90e2] rounded-t"></div>
                <div style={{height: '65%'}} className="w-5 bg-[#4a90e2] rounded-t"></div>
                <div style={{height: '80%'}} className="w-5 bg-[#4a90e2] rounded-t"></div>
                <div style={{height: '90%'}} className="w-5 bg-[#4a90e2] rounded-t"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-[#5a6a85] mt-2">
              <span>Enero</span>
              <span>Febrero</span>
              <span>Marzo</span>
              <span>Abril</span>
              <span>Mayo</span>
              <span>Junio</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-[#eaeef3] p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Cuotas y Limitaciones</h3>
        
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#eaeef3]">
              <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Plan</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Límite de consultas</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Tasa por minuto</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-[#5a6a85]">Caché</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#eaeef3]">
              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">Básico</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">1,000 / mes</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">10</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">1 hora</td>
            </tr>
            <tr className="border-b border-[#eaeef3]">
              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">Profesional</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">5,000 / mes</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">30</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">30 minutos</td>
            </tr>
            <tr className="border-b border-[#eaeef3]">
              <td className="py-3 px-4 text-sm text-[#2c3e50] font-medium">Empresarial</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">20,000 / mes</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">100</td>
              <td className="py-3 px-4 text-sm text-[#5a6a85]">15 minutos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Renderizar el contenido según la pestaña activa
  return (
    <div>
      {activeTab === 'documentacion' && renderDocumentationTab()}
      {activeTab === 'ejemplos' && renderExamplesTab()}
      {activeTab === 'precios' && renderPricingTab()}
      {activeTab === 'metricas' && renderMetricsTab()}
    </div>
  );
};

export default ApiDetailContent;