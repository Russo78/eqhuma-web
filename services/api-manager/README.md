# EQHuma API Manager

## Descripción
El EQHuma API Manager es un microservicio diseñado para gestionar, monitorear y analizar el uso de las APIs dentro del ecosistema de EQHuma. Proporciona funcionalidades para la gestión de claves de API, seguimiento de clics, análisis de tráfico, y un sistema básico de CRM para la gestión de prospectos y campañas de marketing.

## Características Principales

### Gestión de APIs
- Creación y administración de instancias de API con claves únicas
- Control de acceso por dominio y dirección IP
- Limitación de tasas de uso configurables
- Regeneración de claves de API y secretos

### Seguimiento de Clics y Análisis
- Registro detallado de cada interacción con la API
- Análisis de datos demográficos y geográficos
- Seguimiento de navegadores, sistemas operativos y dispositivos
- Panel de estadísticas en tiempo real

### Marketing y CRM
- Creación de enlaces UTM para seguimiento de campañas
- Gestión de códigos promocionales
- Sistema básico de gestión de prospectos
- Segmentación de clientes por criterios personalizables

## Tecnologías Utilizadas
- **Node.js**: Entorno de ejecución de JavaScript
- **Express**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL
- **JWT**: Sistema de autenticación basado en tokens
- **Mongoose**: ODM para MongoDB

## Requisitos Previos
- Node.js (v14 o superior)
- MongoDB (v4.4 o superior)
- npm o pnpm como gestor de paquetes

## Instalación

### Clonar el repositorio


### Instalar dependencias


### Configurar variables de entorno
Crea un archivo `.env` basado en el archivo de ejemplo `.env.example`:



Edita el archivo `.env` con tu configuración: