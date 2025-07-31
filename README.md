# Week Planner 📅

Una aplicación de planificación semanal que funciona completamente en el navegador con almacenamiento local.

## Características

- 📅 Vista de calendario semanal interactiva
- ✅ Gestión de tareas con prioridades y categorías
- 📝 Eventos con ubicación y asistentes
- 🎯 Sistema de categorización (Trabajo, Personal, Salud, Educación, Social)
- 🚦 Niveles de prioridad (Baja, Media, Alta, Urgente)
- ✨ Interfaz moderna y responsiva con Tailwind CSS
- 💾 Almacenamiento local en el navegador (LocalStorage)
- 🚀 Funciona sin conexión a internet
- 🖥️ Aplicación de una sola página (SPA)

## Stack Tecnológico

### Frontend

- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **React Hooks** - Gestión de estado

### Backend

- **NestJS** - Framework de Node.js
- **TypeScript** - Tipado estático
- **Class Validator** - Validación de datos
- **In-Memory Storage** - Almacenamiento temporal para desarrollo

## Estructura del Proyecto

```
week-planner/
├── src/                      # Frontend (Next.js)
│   ├── app/                 # App Router
│   ├── components/          # Componentes React
│   ├── services/           # Servicios de API
│   └── types/              # Definiciones de tipos TypeScript
├── backend/                 # Backend (NestJS)
│   ├── src/
│   │   ├── tasks/          # Módulo de tareas
│   │   ├── events/         # Módulo de eventos
│   │   ├── dto/            # Data Transfer Objects
│   │   └── interfaces/     # Interfaces TypeScript
│   └── package.json
└── package.json
```

## Instalación y Configuración

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn

#### Instalación

1. **Instalar dependencias:**

```bash
npm install
```

## Ejecución del Proyecto

### Desarrollo

1. **Iniciar la aplicación:**

```bash
npm run dev
```

2. **Abrir el navegador en:**
   - Aplicación: http://localhost:3000

### Producción

```bash
npm run build
npm start
```

## API Endpoints

### Tareas

- `GET /api/tasks?userId=xxx` - Obtener todas las tareas
- `POST /api/tasks` - Crear nueva tarea
- `GET /api/tasks/:id?userId=xxx` - Obtener tarea específica
- `PATCH /api/tasks/:id?userId=xxx` - Actualizar tarea
- `DELETE /api/tasks/:id?userId=xxx` - Eliminar tarea
- `PATCH /api/tasks/:id/complete?userId=xxx` - Marcar como completada
- `PATCH /api/tasks/:id/incomplete?userId=xxx` - Marcar como pendiente

### Eventos

- `GET /api/events?userId=xxx` - Obtener todos los eventos
- `POST /api/events` - Crear nuevo evento
- `GET /api/events/:id?userId=xxx` - Obtener evento específico
- `PATCH /api/events/:id?userId=xxx` - Actualizar evento
- `DELETE /api/events/:id?userId=xxx` - Eliminar evento

## Filtros Disponibles

### Tareas

- Por rango de fechas: `?startDate=2024-01-01&endDate=2024-01-07`
- Por categoría: `?category=work`
- Por prioridad: `?priority=high`

### Eventos

- Por rango de fechas: `?startDate=2024-01-01&endDate=2024-01-07`
- Por ubicación: `?location=oficina`
- Por asistente: `?attendee=email@example.com`

## Tipos de Datos

### Categorías de Tareas

- `work` - Trabajo 💼
- `personal` - Personal 🏠
- `health` - Salud 💪
- `education` - Educación 📚
- `social` - Social 👥
- `other` - Otro 📝

### Prioridades

- `low` - Baja 🟢
- `medium` - Media 🟡
- `high` - Alta 🟠
- `urgent` - Urgente 🔴

## Funcionalidades

- ✅ Crear, editar y eliminar tareas
- ✅ Marcar tareas como completadas/pendientes
- ✅ Vista de calendario semanal
- ✅ Navegación entre semanas
- ✅ Filtrado por categorías y prioridades
- ✅ Gestión de eventos con ubicación y asistentes
- ✅ Interfaz responsiva
- ✅ Validación de datos en backend
- ✅ Manejo de errores

## Próximas Mejoras

- 🔄 Integración con base de datos (PostgreSQL/MongoDB)
- 🔐 Sistema de autenticación
- 📱 Aplicación móvil (React Native)
- 🔔 Notificaciones push
- 📊 Estadísticas y reportes
- 🎨 Temas personalizables
- 📅 Vista mensual y anual
- 🔄 Sincronización con calendarios externos

## Desarrollo

### Scripts Disponibles

**Frontend:**

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter

**Backend:**

- `npm run start:dev` - Servidor de desarrollo con hot reload
- `npm run build` - Build de producción
- `npm run start:prod` - Servidor de producción
- `npm run test` - Tests unitarios

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
