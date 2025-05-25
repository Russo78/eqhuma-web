/**
 * Servicios de API para eqhuma
 * 
 * Este módulo proporciona funciones para interactuar con las APIs
 * disponibles en la plataforma, incluyendo listado, búsqueda y
 * obtención de detalles.
 */

// URL base para las peticiones de API (ejemplo con datos simulados)
const API_URL = 'https://api.eqhuma.mx/apis';

// Datos de ejemplo para desarrollo
const APIS_EJEMPLO = [
  {
    id: '001',
    nombre: 'Obtener RFC con CURP',
    institucion: 'SAT',
    descripcion: 'Obtiene el RFC Oficial registrado en el SAT, mediante el envío de CURP. No se muestran resultados de RFC sin registro.',
    tipo: 'default',
    consultas: 159184,
    tiempoRespuesta: 876,
    fechaCreacion: '2022-08-15'
  },
  {
    id: '002',
    nombre: 'Calcular RFC con datos',
    institucion: 'SAT',
    descripcion: 'Calcula el RFC mediante algoritmo con datos de la persona. Este endpoint genera el RFC usando los datos de la persona, y no lo valida con la base de datos del SAT.',
    tipo: 'default',
    consultas: 35769,
    tiempoRespuesta: 220,
    fechaCreacion: '2022-09-20'
  },
  {
    id: '003',
    nombre: 'Localiza NSS con CURP',
    institucion: 'IMSS',
    descripcion: 'Obtiene el Número de Seguro Social ligado a la CURP proporcionada. Consulta oficial en las bases de datos del IMSS.',
    tipo: 'default',
    consultas: 244727,
    tiempoRespuesta: 1037,
    fechaCreacion: '2022-06-05'
  },
  {
    id: '004',
    nombre: 'Valida CURP API',
    institucion: 'RENAPO',
    descripcion: 'Valida CURP API, es una API REST para la obtención y validación de los registros de nacimiento relacionados a la Clave Única de Registro de Población (CURP) en RENAPO.',
    tipo: 'special',
    consultas: 405303,
    tiempoRespuesta: 1634,
    fechaCreacion: '2021-11-30'
  },
  {
    id: '005',
    nombre: 'Buscar Crédito INFONAVIT',
    institucion: 'INFONAVIT',
    descripcion: 'Consulta información de créditos de INFONAVIT mediante el Número de Seguridad Social. Proporciona detalles sobre estado del crédito y saldo.',
    tipo: 'default',
    consultas: 89452,
    tiempoRespuesta: 952,
    fechaCreacion: '2023-01-15'
  },
  {
    id: '006',
    nombre: 'Validar Cédula Profesional',
    institucion: 'SEP',
    descripcion: 'Valida la información de cédulas profesionales emitidas por la SEP. Confirma autenticidad y obtiene detalles del profesionista.',
    tipo: 'default',
    consultas: 125678,
    tiempoRespuesta: 876,
    fechaCreacion: '2022-11-10'
  }
];

// Detalles adicionales para la API con ID 001
const API_DETALLE_001 = {
  id: '001',
  nombre: 'Obtener RFC con CURP',
  institucion: 'SAT',
  descripcion: 'Obtiene el RFC Oficial registrado en el SAT, mediante el envío de CURP. No se muestran resultados de RFC sin registro.',
  tipo: 'default',
  consultas: 159184,
  tiempoRespuesta: 876,
  fechaCreacion: '2022-08-15',
  url: 'https://api.eqhuma.mx/v1/sat/rfc-by-curp',
  metodo: 'POST',
  formato: 'JSON',
  parametros: [
    {
      nombre: 'curp',
      tipo: 'String',
      requerido: true,
      descripcion: 'CURP de la persona a consultar (18 caracteres)'
    },
    {
      nombre: 'api_key',
      tipo: 'String',
      requerido: true,
      descripcion: 'Clave de API para autenticación'
    }
  ],
  respuestas: {
    exito: {
      codigo: 200,
      ejemplo: '{\n  "success": true,\n  "rfc": "OEGH901122ABC",\n  "status": "active",\n  "source": "sat",\n  "message": "RFC encontrado",\n  "timestamp": "2023-10-25T15:30:45Z"\n}'
    },
    error: {
      codigo: 404,
      ejemplo: '{\n  "success": false,\n  "error": "curp_not_found",\n  "message": "No se encontró un RFC asociado a la CURP proporcionada",\n  "timestamp": "2023-10-25T15:31:10Z"\n}'
    }
  },
  codigosEstado: [
    { codigo: 200, descripcion: 'Éxito. La solicitud se procesó correctamente.' },
    { codigo: 400, descripcion: 'Solicitud incorrecta. Falta un parámetro requerido o la CURP tiene formato inválido.' },
    { codigo: 401, descripcion: 'No autorizado. La API key es inválida o ha expirado.' },
    { codigo: 404, descripcion: 'No encontrado. No se encontró un RFC asociado a la CURP proporcionada.' },
    { codigo: 429, descripcion: 'Demasiadas solicitudes. Has excedido el límite de solicitudes permitidas.' },
    { codigo: 500, descripcion: 'Error interno del servidor.' }
  ],
  documentacion: 'Esta API permite obtener el RFC (Registro Federal de Contribuyentes) oficial registrado en el SAT (Servicio de Administración Tributaria) a partir de la CURP (Clave Única de Registro de Población) proporcionada. Es importante destacar que no se mostrarán resultados de RFC sin registro.',
  precios: [
    { plan: 'Básico', precio: 0.50, cuota: '1,000 consultas/mes' },
    { plan: 'Profesional', precio: 0.35, cuota: '5,000 consultas/mes' },
    { plan: 'Empresarial', precio: 0.25, cuota: '20,000 consultas/mes' }
  ]
};

/**
 * Obtiene la lista de APIs disponibles con paginación
 * @param {number} pagina - Número de página a consultar
 * @param {number} porPagina - Cantidad de APIs por página
 * @returns {Promise<{apis: Array, total: number, totalPaginas: number}>} - Lista de APIs y metadatos de paginación
 * @throws {Error} - Si no se pueden obtener las APIs
 */
export const obtenerApis = async (pagina = 1, porPagina = 6) => {
  try {
    // En un entorno real, aquí se haría la petición al servidor
    // Por ahora, usamos los datos de ejemplo
    
    // Simulamos paginación
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const apisEnPagina = APIS_EJEMPLO.slice(inicio, fin);
    const total = APIS_EJEMPLO.length;
    const totalPaginas = Math.ceil(total / porPagina);
    
    return {
      apis: apisEnPagina,
      total,
      totalPaginas
    };
  } catch (error) {
    console.error('Error al obtener APIs:', error);
    throw new Error('No se pudo obtener la lista de APIs');
  }
};

/**
 * Busca APIs según diferentes criterios
 * @param {string} termino - Término de búsqueda
 * @param {string} institucion - Filtrar por institución
 * @param {string} tipo - Filtrar por tipo de API
 * @param {string} ordenarPor - Criterio de ordenamiento
 * @param {number} pagina - Número de página
 * @param {number} porPagina - Cantidad de APIs por página
 * @returns {Promise<{apis: Array, total: number, totalPaginas: number}>} - APIs filtradas y metadatos de paginación
 * @throws {Error} - Si no se pueden buscar las APIs
 */
export const buscarApiPorTermino = async (
  termino = '', 
  institucion = '', 
  tipo = '', 
  ordenarPor = 'popular', 
  pagina = 1, 
  porPagina = 6
) => {
  try {
    // En un entorno real, aquí se haría la petición al servidor
    // Por ahora, filtramos y ordenamos los datos de ejemplo
    
    // Filtrar por término de búsqueda
    let resultados = APIS_EJEMPLO;
    
    if (termino) {
      termino = termino.toLowerCase();
      resultados = resultados.filter(api => 
        api.nombre.toLowerCase().includes(termino) ||
        api.descripcion.toLowerCase().includes(termino) ||
        api.institucion.toLowerCase().includes(termino)
      );
    }
    
    // Filtrar por institución
    if (institucion) {
      resultados = resultados.filter(api => 
        api.institucion.toLowerCase() === institucion.toLowerCase()
      );
    }
    
    // Filtrar por tipo
    if (tipo) {
      resultados = resultados.filter(api => 
        api.tipo.toLowerCase() === tipo.toLowerCase()
      );
    }
    
    // Ordenar resultados
    switch (ordenarPor) {
      case 'popular':
        resultados.sort((a, b) => b.consultas - a.consultas);
        break;
      case 'recent':
        resultados.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        break;
      case 'response':
        resultados.sort((a, b) => a.tiempoRespuesta - b.tiempoRespuesta);
        break;
      default:
        resultados.sort((a, b) => b.consultas - a.consultas);
    }
    
    // Aplicar paginación
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const apisEnPagina = resultados.slice(inicio, fin);
    const total = resultados.length;
    const totalPaginas = Math.ceil(total / porPagina);
    
    return {
      apis: apisEnPagina,
      total,
      totalPaginas
    };
  } catch (error) {
    console.error('Error al buscar APIs:', error);
    throw new Error('No se pudo realizar la búsqueda de APIs');
  }
};

/**
 * Obtiene los detalles completos de una API específica
 * @param {string} id - ID de la API a consultar
 * @returns {Promise<object>} - Objeto con todos los detalles de la API
 * @throws {Error} - Si no se encuentran los detalles de la API
 */
export const buscarApiPorId = async (id) => {
  try {
    // En un entorno real, aquí se haría la petición al servidor
    // Por ahora, simulamos la respuesta según el ID
    
    if (id === '001') {
      return API_DETALLE_001;
    }
    
    // Para otros IDs, buscamos en la lista general y devolvemos información básica
    const api = APIS_EJEMPLO.find(a => a.id === id);
    
    if (api) {
      return {
        ...api,
        url: `https://api.eqhuma.mx/v1/${api.institucion.toLowerCase()}/${api.nombre.toLowerCase().replace(/ /g, '-')}`,
        metodo: 'POST',
        formato: 'JSON',
        parametros: [
          {
            nombre: 'api_key',
            tipo: 'String',
            requerido: true,
            descripcion: 'Clave de API para autenticación'
          }
        ],
        respuestas: {
          exito: {
            codigo: 200,
            ejemplo: '{\n  "success": true,\n  "data": {},\n  "timestamp": "2023-10-25T15:30:45Z"\n}'
          },
          error: {
            codigo: 400,
            ejemplo: '{\n  "success": false,\n  "error": "bad_request",\n  "message": "Parámetros incorrectos",\n  "timestamp": "2023-10-25T15:31:10Z"\n}'
          }
        },
        codigosEstado: [
          { codigo: 200, descripcion: 'Éxito. La solicitud se procesó correctamente.' },
          { codigo: 400, descripcion: 'Solicitud incorrecta. Falta un parámetro requerido.' },
          { codigo: 401, descripcion: 'No autorizado. La API key es inválida o ha expirado.' },
          { codigo: 500, descripcion: 'Error interno del servidor.' }
        ],
        documentacion: api.descripcion,
        precios: [
          { plan: 'Básico', precio: 0.50, cuota: '1,000 consultas/mes' },
          { plan: 'Profesional', precio: 0.35, cuota: '5,000 consultas/mes' },
          { plan: 'Empresarial', precio: 0.25, cuota: '20,000 consultas/mes' }
        ]
      };
    }
    
    // Si no se encuentra, lanzamos un error
    throw new Error('API no encontrada');
  } catch (error) {
    console.error(`Error al buscar API con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas de uso de las APIs por el usuario
 * @returns {Promise<object>} - Objeto con estadísticas de uso
 * @throws {Error} - Si no se pueden obtener las estadísticas
 */
export const obtenerEstadisticasUso = async () => {
  try {
    // En un entorno real, aquí se haría la petición al servidor
    // Por ahora, devolvemos datos simulados
    return {
      totalConsultas: 12486,
      totalApis: 5,
      consultasUltimoMes: 3254,
      tiempoPromedioRespuesta: 924,
      tasaExito: 99.2,
      apiMasUtilizada: 'Obtener RFC con CURP',
      cuotaUtilizada: 65.4,
      historialConsultas: [
        { fecha: '2023-05-01', consultas: 110 },
        { fecha: '2023-05-02', consultas: 95 },
        { fecha: '2023-05-03', consultas: 105 },
        { fecha: '2023-05-04', consultas: 128 },
        { fecha: '2023-05-05', consultas: 140 },
        { fecha: '2023-05-06', consultas: 75 },
        { fecha: '2023-05-07', consultas: 60 },
        { fecha: '2023-05-08', consultas: 115 },
        { fecha: '2023-05-09', consultas: 125 },
        { fecha: '2023-05-10', consultas: 135 },
        { fecha: '2023-05-11', consultas: 142 },
        { fecha: '2023-05-12', consultas: 138 },
        { fecha: '2023-05-13', consultas: 90 },
        { fecha: '2023-05-14', consultas: 55 }
      ],
      apiFavoritas: [
        { id: '001', nombre: 'Obtener RFC con CURP', consultas: 5841 },
        { id: '003', nombre: 'Localiza NSS con CURP', consultas: 3254 },
        { id: '004', nombre: 'Valida CURP API', consultas: 2532 },
        { id: '006', nombre: 'Validar Cédula Profesional', consultas: 859 }
      ],
      apiKeys: [
        { id: 'key1', nombre: 'API Key Principal', activa: true, expiracion: '2024-12-31' },
        { id: 'key2', nombre: 'API Key Desarrollo', activa: true, expiracion: '2024-06-30' },
        { id: 'key3', nombre: 'API Key Pruebas', activa: false, expiracion: '2023-12-31' }
      ]
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de uso:', error);
    throw new Error('No se pudieron obtener las estadísticas de uso');
  }
};