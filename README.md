# 🛒 E-Converse

Plataforma completa de comercio electrónico desarrollada como proyecto académico para la Universidad Industrial de Santander.

Sistema de tienda virtual con gestión integral de usuarios, productos, carrito de compras, pasarela de pagos simulada y gestión de pedidos.

---

## 🚀 Stack Tecnológico

### Backend
- **Spring Boot 3.5.6** (Java 20)
- **Spring Security** con autenticación JWT
- **Spring Data MongoDB** para persistencia NoSQL
- **API REST** con endpoints protegidos y manejo de errores
- **BigDecimal** para manejo preciso de moneda

### Base de Datos
- **MongoDB** (NoSQL Database)
- Colecciones: usuarios, roles, categorias, producto, carrito, pedidos
- Índices únicos para garantizar integridad de datos
- Modelo de documentos embebidos para relaciones

### Frontend
- **React 19** con **Vite 7**
- **React Router DOM 7** para navegación SPA
- **Zustand 5** para estado global (auth, cart)
- **Axios** con interceptores JWT automáticos
- **TailwindCSS 3.4** con tema personalizado (gradientes)
- **Heroicons** para iconografía consistente

---

## 📂 Estructura del Proyecto

```
├── backend/                      # API REST con Spring Boot
│   ├── src/main/java/
│   │   └── backend/application/
│   │       ├── controller/       # Endpoints REST
│   │       │   ├── AuthController.java       # Login y registro
│   │       │   ├── UsuarioController.java    # CRUD usuarios
│   │       │   ├── RolController.java        # CRUD roles
│   │       │   ├── CategoriaController.java  # CRUD categorías
│   │       │   ├── ProductoController.java   # CRUD productos
│   │       │   ├── CarritoController.java    # Gestión carrito
│   │       │   └── PedidoController.java     # Gestión pedidos
│   │       ├── model/            # Entidades MongoDB
│   │       │   ├── Usuario.java
│   │       │   ├── Rol.java
│   │       │   ├── Categoria.java
│   │       │   ├── Producto.java
│   │       │   ├── Carrito.java
│   │       │   ├── ItemCarrito.java
│   │       │   ├── Pedido.java
│   │       │   └── ItemPedido.java
│   │       ├── repository/       # Acceso a datos MongoDB
│   │       ├── service/          # Lógica de negocio
│   │       └── seguridad/        # JWT y Spring Security
│   └── pom.xml
│
├── frontend-react/               # SPA con React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx         ✅ Autenticación JWT
│   │   │   ├── Register.jsx      ✅ Registro de usuarios
│   │   │   ├── admin/            # Panel de administración
│   │   │   │   ├── Dashboard.jsx     ✅ Estadísticas y navegación
│   │   │   │   ├── Usuarios.jsx      ✅ CRUD completo
│   │   │   │   ├── Roles.jsx         ✅ CRUD con descripciones
│   │   │   │   ├── Categorias.jsx    ✅ CRUD simplificado
│   │   │   │   ├── Productos.jsx     ✅ CRUD con categorías
│   │   │   │   └── Pedidos.jsx       ✅ Gestión de pedidos
│   │   │   └── client/           # Panel de cliente
│   │   │       └── Dashboard.jsx     ✅ Catálogo + Historial pedidos
│   │   ├── components/
│   │   │   ├── Navbar.jsx            ✅ Navegación dinámica
│   │   │   ├── CartSidebar.jsx       ✅ Carrito lateral
│   │   │   ├── PaymentModal.jsx      ✅ Simulación de pago
│   │   │   ├── ProductCard.jsx       ✅ Tarjeta de producto
│   │   │   ├── ProductModal.jsx      ✅ Detalles del producto
│   │   │   ├── AdminLayout.jsx       ✅ Layout admin
│   │   │   ├── ProtectedRoute.jsx    ✅ Rutas protegidas
│   │   │   └── AdminRoute.jsx        ✅ Rutas solo admin
│   │   ├── services/
│   │   │   ├── api.js            ✅ Cliente Axios + interceptores
│   │   │   └── index.js          ✅ Servicios por módulo
│   │   ├── store/
│   │   │   ├── authStore.js      ✅ Estado de autenticación
│   │   │   └── cartStore.js      ✅ Estado del carrito
│   │   └── index.css             ✅ Estilos globales + Tailwind
│   ├── tailwind.config.js        ✅ Tema personalizado
│   ├── vite.config.ts
│   └── package.json
│
└── frontend/                     # Frontend legacy (Vanilla JS - deprecado)
```

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticación y Seguridad
- ✅ Login con JWT (Bearer token)
- ✅ Registro de usuarios con validación
- ✅ Roles: Administrador y Cliente
- ✅ Rutas protegidas por autenticación
- ✅ Rutas protegidas por rol (AdminRoute)
- ✅ Persistencia de sesión en localStorage
- ✅ Interceptores Axios para tokens automáticos
- ✅ Logout con limpieza de sesión

### 👥 Gestión de Usuarios (Admin)
- ✅ Listar usuarios con búsqueda en tiempo real
- ✅ Crear nuevos usuarios con validaciones
- ✅ Editar información de usuarios
- ✅ Eliminar usuarios con confirmación
- ✅ Asignar roles dinámicamente
- ✅ Toggle estado activo/inactivo
- ✅ Validación de email único

### 🏷️ Gestión de Roles (Admin)
- ✅ Listar todos los roles
- ✅ Crear nuevos roles
- ✅ Editar nombres de roles
- ✅ Eliminar roles (con validación de uso)
- ✅ Descripciones funcionales predefinidas (sin BD)
- ✅ Vista en tabla con acciones

### 📦 Gestión de Categorías (Admin)
- ✅ Listar categorías en tabla
- ✅ Crear nuevas categorías
- ✅ Editar nombres de categorías
- ✅ Eliminar categorías
- ✅ Vista simplificada (solo tabla)
- ✅ Búsqueda y filtrado

### 🛍️ Gestión de Productos (Admin)
- ✅ CRUD completo de productos
- ✅ Asignación de categorías
- ✅ Gestión de stock
- ✅ Carga de imágenes (URL)
- ✅ Búsqueda por nombre
- ✅ Filtro por categoría
- ✅ Validación de precios y stock
- ✅ Vista en tarjetas + tabla

### 📊 Panel de Administración
- ✅ Dashboard con estadísticas en tiempo real:
  - Total de usuarios registrados
  - Total de productos en catálogo
  - Total de pedidos realizados
  - Pedidos pendientes (destacado)
  - Pedidos completados
  - Pedidos cancelados
  - Productos por categoría
- ✅ Navegación a todos los módulos
- ✅ Diseño con gradientes personalizados
- ✅ Botón de regreso al inicio
- ✅ Logout desde cualquier página admin

### 🛒 Carrito de Compras (Cliente)
- ✅ Agregar productos al carrito
- ✅ Actualizar cantidades
- ✅ Eliminar productos individuales
- ✅ Vaciar carrito completo
- ✅ Carrito lateral (sidebar) deslizable
- ✅ Persistencia en MongoDB
- ✅ Un carrito único por usuario (índice único)
- ✅ Cálculo automático de subtotales
- ✅ Visualización de total
- ✅ Ícono con contador de items en navbar

### 💳 Proceso de Compra
- ✅ Modal de simulación de pasarela de pago:
  - Formulario de tarjeta de crédito
  - Validación de número de tarjeta (formato)
  - Validación de fecha de expiración (MM/YY)
  - Validación de CVV (3 dígitos)
  - Tarjeta de prueba: 4111 1111 1111 1111
  - Animación de procesamiento (2 segundos)
  - Confirmación de pago exitoso
- ✅ Creación automática de pedido tras pago
- ✅ Vaciado automático del carrito tras compra
- ✅ Notificación de pedido creado

### 📋 Gestión de Pedidos (Admin)
- ✅ Listar todos los pedidos del sistema
- ✅ Búsqueda por cliente, email o ID
- ✅ Filtro por estado (Todos/Pendiente/Completado/Cancelado)
- ✅ Vista detallada de cada pedido en modal
- ✅ Cambio de estado de pedidos
- ✅ Visualización de productos por pedido
- ✅ Cálculo de totales
- ✅ Ordenamiento por fecha (más reciente primero)
- ✅ Indicadores visuales de estado con colores

### 📱 Catálogo Público (Cliente)
- ✅ Dashboard público sin necesidad de login
- ✅ Vista de todos los productos en tarjetas
- ✅ Filtros avanzados:
  - Por categoría (tabs superiores)
  - Por búsqueda (nombre)
  - Por precio (slider)
  - Por tallas (búsqueda en descripción)
- ✅ Modal de detalles del producto
- ✅ Botón "Agregar al carrito" (requiere login)
- ✅ Diseño responsive
- ✅ Imágenes con fallback

### 📜 Historial de Pedidos (Cliente)
- ✅ Vista de pedidos propios del usuario
- ✅ Tabs para cambiar entre Productos y Mis Pedidos
- ✅ Estado visual de cada pedido:
  - 🟡 Pendiente (amarillo)
  - 🟢 Completado (verde)
  - 🔴 Cancelado (rojo)
- ✅ Detalles completos de cada pedido:
  - Número de pedido
  - Fecha y hora formateadas
  - Lista de productos con cantidades
  - Precios unitarios y subtotales
  - Total del pedido
- ✅ Ordenamiento cronológico (más reciente primero)
- ✅ Mensaje cuando no hay pedidos

### 🎨 Experiencia de Usuario
- ✅ Navbar dinámico según estado de autenticación
- ✅ Logo personalizado con ícono de zapato
- ✅ Card de usuario con email en navbar
- ✅ Tema personalizado con gradientes primary/secondary
- ✅ Animaciones y transiciones suaves
- ✅ Notificaciones con alerts
- ✅ Confirmaciones antes de acciones destructivas
- ✅ Loading states en operaciones asíncronas
- ✅ Responsive design (móvil, tablet, desktop)
- ✅ Manejo de errores con mensajes claros

---

## ✨ Estado Actual del Proyecto

### ✅ Proyecto Completado

Todas las funcionalidades principales han sido implementadas y están operativas:
- Sistema de autenticación completo
- Panel administrativo con todos los CRUDs
- Catálogo público de productos
- Sistema de carrito de compras
- Proceso de checkout con pasarela simulada
- Gestión de pedidos (admin y cliente)
- Estadísticas en tiempo real

---

## 🚦 Instalación y Ejecución

### Prerrequisitos
- **Java 17+** y Maven
- **Node.js 18+** y npm
- **MongoDB** local o MongoDB Atlas

### 1. Clonar repositorio

```bash
git clone https://github.com/JuanSe2731/Proyecto-Spring-Boot-E-converse_vers2.git
cd Proyecto-Spring-Boot-E-converse_vers2
```

### 2. Configurar Base de Datos

**Opción A - MongoDB Atlas (Recomendado):**
- Ya está configurado en `application.properties`
- No requiere instalación local

**Opción B - MongoDB Local:**
- Instalar MongoDB Community Edition
- Modificar `application.properties` con tu URI local

### 3. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run        # Linux/Mac
# o
.\mvnw.cmd spring-boot:run    # Windows
```

El servidor estará en: **http://localhost:8080**

### 4. Frontend (React + Vite)

```bash
cd frontend-react
npm install
npm run dev
```

La aplicación estará en: **http://localhost:5174**

> **Nota:** El puerto 5174 se usa porque 5173 puede estar ocupado.

### 5. Datos Iniciales (Primera vez)

**Insertar roles en MongoDB:**

```json
// Colección: rol
{ "_id": "1", "nombre": "Administrador" }
{ "_id": "2", "nombre": "Cliente" }
```

**Crear categorías de ejemplo:**

```json
// Colección: categorias
{ "nombre": "Deportivos" }
{ "nombre": "Casuales" }
{ "nombre": "Formales" }
```

**Crear usuario administrador:**
1. Regístrate desde `/register`
2. En MongoDB, edita tu usuario y cambia `rol._id` a `"1"`

---

## 🎯 Uso del Sistema

### Como Administrador
1. **Login** en `/login`
2. Acceder al **Dashboard de Admin** (`/admin`)
3. **Gestionar Usuarios:** Crear, editar, eliminar usuarios
4. **Gestionar Roles:** Definir permisos del sistema
5. **Gestionar Categorías:** Organizar productos por tipo
6. **Gestionar Productos:** Crear catálogo completo con imágenes
7. **Ver Pedidos:** Monitorear y cambiar estado de pedidos
8. **Estadísticas:** Ver métricas en tiempo real del negocio

### Como Cliente
1. **Dashboard Público** (`/`) - Explorar productos sin login
2. **Registro** (`/register`) - Crear cuenta de cliente
3. **Login** (`/login`) - Iniciar sesión
4. **Explorar Catálogo:**
   - Filtrar por categoría
   - Buscar por nombre
   - Filtrar por precio
   - Filtrar por talla
5. **Agregar al Carrito:**
   - Ver carrito lateral
   - Modificar cantidades
   - Eliminar productos
   - Vaciar carrito
6. **Realizar Compra:**
   - Hacer checkout
   - Simular pago con tarjeta
   - Confirmar pedido
7. **Ver Historial:**
   - Tab "Mis Pedidos" en dashboard
   - Ver estado de pedidos
   - Ver detalles completos

---

## 🐳 Docker (Backend + Frontend)

Antes de levantar los contenedores define la URL de tu clúster Mongo (por ejemplo en un archivo `.env` en la raíz o exportando la variable en tu terminal):

```bash
export SPRING_DATA_MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/e_converse"
# Windows PowerShell
$env:SPRING_DATA_MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/e_converse"
```

### Construir y levantar todo
```bash
docker compose up --build
```
Servicios resultantes:
- Frontend: http://localhost:8081
- Backend API: http://localhost:8080
- MongoDB: localhost:27017 (volumen `mongo_data`)

### Variables relevantes
| Servicio  | Variable                      | Valor por defecto                     |
|-----------|-------------------------------|---------------------------------------|
| backend   | `SPRING_DATA_MONGODB_URI`     | *(obligatoria, usa tu clúster remoto)*|
| frontend  | build arg `VITE_API_URL`      | `http://backend:8080`                 |

Cambiar el API URL (ej. para entornos externos):
```bash
docker compose build \
  --build-arg VITE_API_URL=https://api.mi-dominio.com frontend
```

### Comandos útiles
```bash
docker compose logs -f backend     # Ver logs del backend
docker compose exec mongo bash     # Entrar al contenedor de Mongo
docker compose down -v             # Apagar y borrar volúmenes
```

> El backend sigue funcionando fuera de Docker usando el URI configurado en `SPRING_DATA_MONGODB_URI` (si no se define, toma `mongodb://localhost:27017/e_converse` del `application.properties`).

---

## 🔧 API Endpoints Principales

### Autenticación
```
POST   /auth/login       - Iniciar sesión (retorna JWT)
POST   /auth/register    - Registrar nuevo usuario
GET    /auth/user-info   - Obtener datos del usuario autenticado
```

### Usuarios (Admin)
```
GET    /usuario/list           - Listar todos los usuarios
GET    /usuario/list/{id}      - Obtener usuario por ID
POST   /usuario/new            - Crear nuevo usuario
PUT    /usuario/update         - Actualizar usuario (requiere idUsuario en body)
DELETE /usuario/delete/{id}    - Eliminar usuario
```

### Roles (Admin)
```
GET    /roles/list          - Listar todos los roles
GET    /roles/list/{id}     - Obtener rol por ID
POST   /roles/new           - Crear nuevo rol
PUT    /roles/update        - Actualizar rol
DELETE /roles/delete/{id}   - Eliminar rol
```

### Categorías (Admin/Público)
```
GET    /categorias/list         - Listar todas las categorías
GET    /categorias/list/{id}    - Obtener categoría por ID
POST   /categorias/new          - Crear nueva categoría
PUT    /categorias/update       - Actualizar categoría
DELETE /categorias/delete/{id}  - Eliminar categoría
```

### Productos (Admin crear/editar, Público ver)
```
GET    /productos/list          - Listar todos los productos
GET    /productos/list/{id}     - Obtener producto por ID
POST   /productos/new           - Crear nuevo producto
PUT    /productos/update        - Actualizar producto
DELETE /productos/delete/{id}   - Eliminar producto
```

### Carrito (Cliente autenticado)
```
GET    /carrito                 - Obtener carrito del usuario
GET    /carrito/mis-items       - Obtener items formateados
POST   /carrito/agregar         - Agregar producto (body: {productoId, cantidad})
PUT    /carrito/actualizar/{productoId}  - Actualizar cantidad (body: {cantidad})
DELETE /carrito/eliminar/{productoId}    - Eliminar producto del carrito
DELETE /carrito/vaciar           - Vaciar carrito completo
```

### Pedidos
```
GET    /pedido/list             - Listar todos (Admin)
GET    /pedido/mis-pedidos      - Listar pedidos del usuario autenticado
GET    /pedido/list/{id}        - Obtener pedido por ID
POST   /pedido/new              - Crear nuevo pedido
PUT    /pedido/update           - Actualizar estado de pedido (Admin)
DELETE /pedido/delete/{id}      - Eliminar pedido (Admin)
```

> **Nota:** Todos los endpoints excepto `/auth/*`, `/productos/list` y `/categorias/list` requieren autenticación JWT en el header `Authorization: Bearer {token}`

---

## 🔒 Seguridad Implementada

- **JWT (JSON Web Tokens):** Autenticación stateless con expiración de 24 horas
- **BCrypt:** Hash seguro de contraseñas con salt
- **CORS:** Configurado para puertos de desarrollo (5173, 5174)
- **Interceptores Axios:** Inyección automática de tokens JWT
- **Rutas Protegidas:** React Router con componentes `ProtectedRoute` y `AdminRoute`
- **Validación de Roles:** Verificación en backend y frontend
- **Índices Únicos:** Email único y carrito único por usuario en MongoDB
- **Manejo de Errores:** Respuestas HTTP estandarizadas

---

## 🎨 Características de UX/UI

- **Tema Personalizado:** Gradientes primary/secondary en Tailwind
- **Componentes Reutilizables:** Navbar, Cards, Modals, Layouts
- **Responsive Design:** Optimizado para móvil, tablet y desktop
- **Animaciones:** Transiciones suaves en hover y cambios de estado
- **Loading States:** Indicadores de carga durante operaciones asíncronas
- **Notificaciones:** Alerts y confirmaciones para acciones importantes
- **Iconografía:** Heroicons consistente en toda la aplicación
- **Validaciones:** Feedback visual en formularios
- **Estados Vacíos:** Mensajes claros cuando no hay datos

---

## 🐛 Solución de Problemas Comunes

**Backend no inicia:**
```
Error: Could not connect to MongoDB
Solución: Verificar conexión a internet (MongoDB Atlas) o URI de conexión
```

**Frontend muestra pantalla blanca:**
```
Solución: 
1. Verificar que el backend esté corriendo en puerto 8080
2. Revisar consola del navegador (F12) para errores
3. npm install para reinstalar dependencias
```

**Error 401 Unauthorized al hacer peticiones:**
```
Solución:
1. Verificar que el token JWT esté en localStorage
2. El token expira cada 24h - volver a hacer login
3. Revisar que el header Authorization tenga formato: "Bearer {token}"
```

**Carrito no se actualiza:**
```
Solución:
1. Verificar que el usuario esté autenticado
2. Revisar que el endpoint /carrito/* esté respondiendo
3. Limpiar localStorage y volver a iniciar sesión
```

**Productos no muestran imágenes:**
```
Solución:
1. Verificar que la URL de la imagen sea accesible
2. El sistema tiene fallback automático a placeholder
3. Revisar CORS si las imágenes están en otro dominio
```

---

## 📚 Estructura de Datos (MongoDB)

### Colección: usuarios
```json
{
  "_id": ObjectId,
  "nombre": String,
  "apellido": String,
  "correo": String (único),
  "contrasena": String (hasheada con BCrypt),
  "direccion": String (opcional),
  "activo": Boolean,
  "rol": {
    "_id": String,
    "nombre": String
  }
}
```

### Colección: producto
```json
{
  "_id": String,
  "nombre": String,
  "descripcion": String,
  "precio": Number,
  "stock": Number,
  "imagenUrl": String,
  "categoria": {
    "_id": String,
    "nombre": String
  }
}
```

### Colección: carrito
```json
{
  "_id": String,
  "idUsuario": String (índice único),
  "usuario": { Usuario completo },
  "fechaCreacion": DateTime,
  "productos": [
    {
      "idProducto": String,
      "nombreProducto": String,
      "precioUnitario": Number,
      "cantidad": Number,
      "subtotal": Number
    }
  ]
}
```

### Colección: pedidos
```json
{
  "_id": String,
  "usuario": { Usuario completo },
  "fechaPedido": DateTime,
  "productos": [
    {
      "idProducto": String,
      "nombreProducto": String,
      "precioUnitario": Number,
      "cantidad": Number,
      "subtotal": Number
    }
  ],
  "total": Number,
  "estado": String (Pendiente|Completado|Cancelado)
}
```

---

## 👥 Equipo

- Juan Sebastián Otero - 2220053
- Daniel Santiago Convers - 2221120
- Juan David Paipa - 2220062
- Jhon Anderson Vargas - 2220086

**Universidad Industrial de Santander (UIS)**
