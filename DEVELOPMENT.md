# Week Planner - Instrucciones de Desarrollo

## Para iniciar el proyecto:

### Opción 1: Iniciar automáticamente ambos servidores

```bash
npm run dev:all
```

### Opción 2: Iniciar servidores por separado

1. **Backend (Terminal 1):**

```bash
cd backend
npm run start:dev
```

2. **Frontend (Terminal 2):**

```bash
npm run dev
```

## URLs de acceso:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

## Estado actual del proyecto:

✅ Estructura completa del proyecto configurada
✅ Backend NestJS con endpoints CRUD para tareas y eventos
✅ Frontend Next.js con calendario semanal interactivo
✅ Componentes para crear y gestionar tareas
✅ Almacenamiento en memoria para desarrollo rápido
✅ CORS configurado para comunicación frontend-backend
✅ Tipos TypeScript compartidos
✅ Tailwind CSS para estilos modernos

## Funcionalidades implementadas:

- Vista de calendario semanal
- Crear, editar y eliminar tareas
- Marcar tareas como completadas
- Categorización por tipo (trabajo, personal, salud, etc.)
- Niveles de prioridad (baja, media, alta, urgente)
- Gestión de eventos con ubicación y asistentes
- Interfaz responsiva y moderna

## Próximos pasos sugeridos:

1. Iniciar los servidores y probar la aplicación
2. Crear algunas tareas de prueba
3. Navegar entre diferentes semanas
4. Implementar funcionalidades adicionales según necesidades
