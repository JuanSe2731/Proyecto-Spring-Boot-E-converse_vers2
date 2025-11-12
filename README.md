# 🛒 E-Converse

Plataforma de comercio electrónico desarrollada como proyecto académico para la Universidad Industrial de Santander.

Sistema completo de tienda virtual con gestión de usuarios, productos, carrito de compras y pedidos.

---

## 🚀 Stack Tecnológico

### Backend
- **Spring Boot 3.5.6** (Java 20)
- **Spring Security** con autenticación JWT
- **Spring Data MongoDB** para persistencia NoSQL
- **API REST** con manejo de errores centralizado

### Base de Datos
- **MongoDB Atlas** (Cloud Database)
- Sin instalación local requerida
- Modelo de documentos flexible

### Frontend
- **React 18** con **Vite 7**
- **React Router** para navegación SPA
- **Zustand** para estado global (auth, cart)
- **Axios** con interceptores JWT
- **TailwindCSS 3.4** para estilos
- **Heroicons** para iconografía

---

## 📂 Estructura del Proyecto

```
├── backend/                      # API REST con Spring Boot
│   ├── src/main/java/
│   │   └── backend/application/
│   │       ├── controller/       # Endpoints REST
│   │       ├── model/           # Entidades MongoDB
│   │       ├── repository/      # Acceso a datos
│   │       ├── service/         # Lógica de negocio
│   │       └── seguridad/       # JWT y Spring Security
│   └── src/main/resources/
│       └── application.properties
│
├── frontend-react/              # SPA con React
│   ├── src/
│   │   ├── pages/              # Páginas de la aplicación
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── admin/          # Panel de administración
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Usuarios.jsx    ✅ COMPLETO
│   │   │   └── client/         # Panel de cliente
│   │   │       ├── Dashboard.jsx   ⏳ Pendiente
│   │   │       └── Cart.jsx        ⏳ Pendiente
│   │   ├── components/         # Componentes reutilizables
│   │   ├── services/           # API clients (Axios)
│   │   └── store/              # Estado global (Zustand)
│   └── package.json
│
└── frontend/                    # Frontend legacy (Vanilla JS)
```

---

## ✨ Estado Actual del Proyecto

### ✅ Implementado

**Autenticación**
- Login con JWT (Bearer token)
- Registro de usuarios (rol Cliente por defecto)
- Rutas protegidas por rol (Admin/Cliente)
- Persistencia de sesión en localStorage

**Panel Administrativo**
- Dashboard con menú de módulos
- **CRUD de Usuarios completo:**
  - Listar usuarios con búsqueda
  - Crear/Editar con validaciones
  - Eliminar con confirmación
  - Asignar roles dinámicamente
  - Toggle estado activo/inactivo

### ⏳ Pendiente (Backend disponible)

- CRUD de Roles
- CRUD de Categorías
- CRUD de Productos
- Catálogo público de productos (Cliente)
- Carrito de compras
- Gestión de pedidos

---

## 🚦 Instalación y Ejecución

### Prerrequisitos
- **Java 17+** y Maven
- **Node.js 18+** y npm
- **MongoDB Atlas** (ya configurado, sin instalación local necesaria)

### 1. Clonar repositorio

```bash
git clone https://github.com/JuanSe2731/Proyecto-Spring-Boot-E-converse.git
cd Proyecto-Spring-Boot-E-converse
```

### 2. Backend (Spring Boot)

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

El servidor estará en: **http://localhost:8080**

> **Nota:** La conexión a MongoDB Atlas ya está configurada en `application.properties`. No requiere instalación local de base de datos.

### 3. Frontend (React)

```powershell
cd frontend-react
npm install
npm run dev
```

La aplicación estará en: **http://localhost:5173**

### 4. Datos Iniciales

**Insertar roles en MongoDB** (solo la primera vez):

Usar MongoDB Compass con URI: `mongodb+srv://admin1:mongo1@cluster0.elouxfb.mongodb.net/`

En la colección `rol` de la BD `e_converse`, insertar:

```json
{ "_id": "1", "nombre": "Administrador" }
{ "_id": "2", "nombre": "Cliente" }
{ "_id": "3", "nombre": "Vendedor" }
```

**Crear usuario administrador:**
1. Regístrate desde `/register`
2. En MongoDB Compass, edita tu usuario y cambia `rol.idRol` a `"1"`

---

## 🎯 Uso del Sistema

### Como Administrador
1. Login con cuenta de administrador
2. Acceder a `/admin/dashboard`
3. **Módulo Usuarios:** Gestión completa (crear, editar, eliminar, buscar)
4. Otros módulos: En desarrollo

### Como Cliente
1. Registro desde `/register` (campos: nombre, apellido, email, contraseña, dirección opcional)
2. Login con credenciales
3. Dashboard cliente: En desarrollo

---

## 🔧 API Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

### Usuarios (Admin)
- `GET /usuario/list` - Listar todos
- `POST /usuario/new` - Crear usuario
- `PUT /usuario/update` - Actualizar (incluir `idUsuario` en body)
- `DELETE /usuario/delete/{id}` - Eliminar

### Otros módulos
- `/roles/*` - CRUD roles (backend listo)
- `/categorias/*` - CRUD categorías (backend listo)
- `/productos/*` - CRUD productos (backend listo)
- `/carrito/*` - Gestión de carrito (backend listo)
- `/pedidos/*` - Gestión de pedidos (backend listo)

---

## 🔒 Seguridad

- **JWT** con expiración de 24 horas
- **BCrypt** para hash de contraseñas
- **CORS** habilitado para puertos de desarrollo (5173, 5174)
- **Interceptores Axios** para inyección automática de tokens
- **Rutas protegidas** por rol en React Router

---

## 🐛 Solución de Problemas

**Backend no inicia:**
- Verificar conexión a internet (MongoDB Atlas es remoto)
- Revisar `application.properties`

**Frontend no aplica estilos:**
- Ejecutar `npm install` nuevamente
- Reiniciar servidor Vite (`Ctrl+C` y `npm run dev`)

**Error 401 al llamar API:**
- Verificar token en localStorage
- Token expira cada 24h (volver a hacer login)

---

## 👥 Equipo

- Juan Sebastián Otero - 2220053
- Daniel Santiago Convers - 2221120
- Juan David Paipa - 2220062
- Jhon Anderson Vargas - 2220086

**Universidad Industrial de Santander (UIS)**
