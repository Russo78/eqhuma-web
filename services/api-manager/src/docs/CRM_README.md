# Módulo CRM para EQHuma API Manager

## Descripción
El módulo CRM (Customer Relationship Management) de EQHuma API Manager permite gestionar prospectos, seguimientos de clientes potenciales y segmentación para estrategias de marketing. Este módulo facilita la organización y seguimiento de leads comerciales con una interfaz API RESTful completa.

## Características principales

### Gestión de Prospectos
- **Creación y gestión** de prospectos con información completa
- **Seguimiento del estado** (nuevo, contactado, calificado, etc.)
- **Historial de cambios** para auditoría completa
- **Sistema de puntuación** (scoring) para priorización
- **Notas y comentarios** colaborativos
- **Asignación de responsables** para seguimiento
- **Compartir prospectos** entre usuarios con permisos diferenciados

### Segmentación
- **Creación de segmentos dinámicos** basados en múltiples criterios
- **Estadísticas automáticas** de cada segmento
- **Criterios avanzados de filtrado** para campañas específicas
- **Segmentos públicos y privados** según necesidades organizacionales
- **Compartir segmentos** entre usuarios

## Estructura de datos

### Prospecto
```javascript
{
  firstName: String,       // Nombre (requerido)
  lastName: String,        // Apellido (requerido)
  email: String,           // Correo electrónico
  phone: String,           // Teléfono
  company: String,         // Empresa
  position: String,        // Cargo
  status: String,          // Estado (new, contacted, qualified, proposal, negotiation, won, lost, dormant)
  segment: String,         // Segmento (individual, small_business, mid_market, enterprise, government, education, other)
  score: Number,           // Puntuación (0-100)
  tags: [String],          // Etiquetas
  notes: [{                // Notas
    content: String,
    user: ObjectId,
    createdAt: Date
  }],
  owner: ObjectId,         // Propietario (usuario)
  assignedTo: ObjectId,    // Asignado a (usuario)
  sharedWith: [{           // Compartido con
    user: ObjectId,
    permission: String     // read, write
  }]
}
```

### Segmento
```javascript
{
  name: String,            // Nombre del segmento (requerido)
  description: String,     // Descripción
  criteria: Object,        // Criterios para incluir prospectos
  isPublic: Boolean,       // Si es visible para todos
  stats: {                 // Estadísticas
    totalProspects: Number,
    activeProspects: Number,
    conversionRate: Number,
    avgScore: Number,
    lastUpdated: Date
  },
  owner: ObjectId,         // Propietario
  sharedWith: [{           // Compartido con
    user: ObjectId,
    permission: String     // read, write
  }]
}
```

## API Endpoints

### Prospectos

| Método | Ruta | Descripción | Permisos |
|--------|------|-------------|----------|
| GET | `/api/v1/crm/prospects` | Obtener todos los prospectos | Todos |
| POST | `/api/v1/crm/prospects` | Crear nuevo prospecto | admin, manager, staff |
| GET | `/api/v1/crm/prospects/:id` | Obtener un prospecto específico | Propietario, asignado, compartido |
| PUT | `/api/v1/crm/prospects/:id` | Actualizar un prospecto | Propietario, asignado, compartido (write) |
| DELETE | `/api/v1/crm/prospects/:id` | Eliminar un prospecto | admin, manager, propietario |
| POST | `/api/v1/crm/prospects/:id/share` | Compartir prospecto con usuario | admin, manager, propietario |
| DELETE | `/api/v1/crm/prospects/:id/share/:userId` | Dejar de compartir prospecto | admin, manager, propietario |
| POST | `/api/v1/crm/prospects/:id/assign` | Asignar prospecto a usuario | admin, manager, propietario |
| POST | `/api/v1/crm/prospects/:id/notes` | Añadir nota al prospecto | Propietario, asignado, compartido |

### Segmentos

| Método | Ruta | Descripción | Permisos |
|--------|------|-------------|----------|
| GET | `/api/v1/crm/segments` | Obtener todos los segmentos | Todos (filtrados) |
| POST | `/api/v1/crm/segments` | Crear nuevo segmento | admin, manager, staff |
| GET | `/api/v1/crm/segments/:id` | Obtener un segmento específico | Público, propietario, compartido |
| PUT | `/api/v1/crm/segments/:id` | Actualizar un segmento | Propietario, compartido (write) |
| DELETE | `/api/v1/crm/segments/:id` | Eliminar un segmento | admin, manager, propietario |
| POST | `/api/v1/crm/segments/:id/share` | Compartir segmento con usuario | admin, manager, propietario |

## Ejemplos de uso

### Crear un prospecto
```http
POST /api/v1/crm/prospects
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@empresa.com",
  "phone": "5551234567",
  "company": "Empresa ABC",
  "position": "Gerente de Sistemas",
  "status": "new",
  "segment": "mid_market",
  "score": 65,
  "tags": ["webinar", "interesado"]
}
```

### Crear un segmento dinámico
```http
POST /api/v1/crm/segments
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Clientes potenciales de alto valor",
  "description": "Prospectos con score mayor a 70 en empresas medianas y grandes",
  "criteria": {
    "minScore": 70,
    "segment": ["mid_market", "enterprise"],
    "status": ["qualified", "proposal", "negotiation"]
  },
  "isPublic": false,
  "tags": ["alto valor", "prioritario"]
}
```

## Integración con otros módulos

### API Management
Los prospectos pueden tener un campo `apiInteractions` que registra sus interacciones con las APIs gestionadas por el módulo API Manager, permitiendo seguimiento automático de conversiones.

### Marketing
El módulo CRM se integra con el módulo de Marketing para permitir seguimiento de UTM parameters y campañas, con campos como `utmSource`, `utmMedium`, etc. en los prospectos.

## Pruebas
Puedes ejecutar el script de pruebas para crear datos de ejemplo en el CRM:

```bash
node src/tests/crmTest.js
```

Esto creará usuarios, prospectos y segmentos de prueba para verificar la funcionalidad del módulo CRM.