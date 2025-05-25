
## Requisitos

- Docker & Docker Compose
- Node.js & npm (para desarrollo local)

## Primer arranque

1. Copia el `.env.example` a cada carpeta `services/*/.env` y a `frontend/.env`.  
2. Completa tus secretos (SMTP, JWT, URLs, etc.).  
3. En la raíz del proyecto:

   ```bash
   npm install      # instala dependencias en todos los workspaces
   npm run start:dev

Accede a:

API Manager: http://localhost:5000

Courses: http://localhost:4000

Webinars: http://localhost:5002

API Market: http://localhost:5003

Frontend: http://localhost:3000

Scripts útiles
npm run start → Levanta los contenedores sin rebuild

npm run start:dev → Levanta con build forzado

npm run build → Solo build de imágenes

npm run down → Baja todos los contenedores


---

Con esto ya tienes un **monorepo** completo, con:

- `services/api-manager`  
- `services/courses`  
- `services/webinars`  
- `services/apimarket-api`  
- `frontend` (sitio web)

orquestado y documentado.  

Cuando termines de revisar y personalizar tus `.env`, simplemente:

```bash
docker compose up --build -d
