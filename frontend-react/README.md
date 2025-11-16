# E-converse - Frontend React

Frontend moderno para E-converse construido con React + Vite + Tailwind CSS.

## 🚀 Características Implementadas

### ✅ Autenticación
- Login con validación de credenciales
- Registro de nuevos usuarios
- Gestión de sesión con JWT
- Redirección automática según rol (Admin/Cliente)

### ✅ Dashboard del Cliente (Público)
- Catálogo de productos con imágenes
- **Acceso sin necesidad de login**
- Botón de "Iniciar Sesión" en la navbar
- Filtros por:
  - Categoría
  - Precio (slider)
  - Tallas (búsqueda en descripción)
  - Búsqueda por nombre
- Modal de detalles del producto
- Agregar productos al carrito (requiere login)

### ✅ Carrito de Compras
- Sidebar lateral animado
- Solo visible para usuarios autenticados
- Agregar/Eliminar productos
- Actualizar cantidades
- Cálculo automático de:
  - Subtotal
  - IVA (19%)
  - Total

### ✅ Panel de Administración
- Dashboard con tarjetas de acceso
- Gestión de Usuarios (implementado)
- Gestión de Roles (pendiente)
- Gestión de Categorías (pendiente)
- Gestión de Productos (pendiente)

## 📦 Instalación

```bash
# Navegar a la carpeta del frontend
cd frontend-react

# Instalar dependencias
npm install
```

## 🏃‍♂️ Ejecutar el Proyecto

```bash
# Iniciar el servidor de desarrollo
npm start
# o
npm run dev

# El proyecto estará disponible en:
# http://localhost:5173
```

## 🔧 Configuración

El archivo `.env` contiene la URL del backend:

```env
VITE_API_URL=http://localhost:8080
```

Asegúrate de que el backend esté corriendo en el puerto 8080.

## 🎨 Tecnologías Utilizadas

- **React 19** - Biblioteca de UI
- **Vite 7** - Build tool y dev server
- **React Router DOM 7** - Enrutamiento
- **Tailwind CSS 3** - Estilos
- **Zustand 5** - Gestión de estado
- **Axios** - Cliente HTTP
- **Heroicons** - Iconos

## 🌐 Rutas Disponibles

### Públicas
- `/` - Redirige a `/dashboard`
- `/dashboard` - Catálogo de productos (público)
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios

### Protegidas (requieren autenticación)
- `/cart` - Carrito de compras

### Admin (requieren rol de Administrador)
- `/admin` - Dashboard de administración
- `/admin/usuarios` - Gestión de usuarios
- `/admin/roles` - Gestión de roles
- `/admin/categorias` - Gestión de categorías
- `/admin/productos` - Gestión de productos

## 🐛 Notas

- El dashboard es **completamente público**, cualquier usuario puede ver los productos sin iniciar sesión
- Para agregar productos al carrito se requiere iniciar sesión
- El carrito lateral solo es visible para usuarios autenticados
- Los administradores ven un botón extra en la navbar para acceder al panel de admin

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
