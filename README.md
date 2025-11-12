# 🛒 E-Converse

**E-Converse** es un sistema de comercio electrónico completo desarrollado como proyecto académico.  
Su objetivo es simular una tienda virtual profesional donde los usuarios pueden registrarse, navegar por un catálogo de productos, agregarlos al carrito y gestionar pedidos.

El proyecto integra **Backend REST API, Frontend SPA y Base de datos relacional**, aplicando buenas prácticas en el desarrollo de aplicaciones web modernas con arquitectura MVC.

---

## 🚀 Tecnologías Utilizadas

### Backend
- **Spring Boot 3.5.6** (Java 17)
  - Spring Security con JWT para autenticación
  - Spring Data JPA/Hibernate para persistencia
  - API REST con ResponseEntity y manejo de errores
  - CORS configurado para desarrollo local
  - Logging detallado en controladores

### Base de Datos
- **PostgreSQL** (Motor principal)
- **MySQL** (Alternativa compatible)
  - Modelo relacional normalizado
  - Relaciones con cascada para integridad referencial
  - Índices optimizados para consultas frecuentes

### Frontend
- **Vanilla JavaScript** (ES6+)
  - Sin frameworks para mayor control y aprendizaje
  - Fetch API para consumo de REST endpoints
  - Manejo de estado con LocalStorage
  - Diseño responsive sin dependencias

- **HTML5 + CSS3**
  - Diseño moderno con gradientes y transiciones
  - Grid y Flexbox para layouts responsive
  - Font Awesome para iconografía
  - Temas personalizados con variables CSS

---

## 📂 Estructura del Proyecto

```
Proyecto-Spring-Boot-E-converse/
├── backend/
│   ├── src/main/java/backend/application/
│   │   ├── config/          # Configuración de seguridad y CORS
│   │   ├── controller/      # Endpoints REST (8 controladores)
│   │   ├── model/           # Entidades JPA (8 modelos)
│   │   ├── repository/      # Repositorios Spring Data
│   │   ├── service/         # Lógica de negocio
│   │   ├── seguridad/       # JWT y autenticación
│   │   └── exception/       # Manejo de excepciones
│   ├── src/main/resources/
│   │   └── application.properties  # Configuración de BD y JWT
│   └── pom.xml              # Dependencias Maven
│
└── frontend/
    ├── views/
    │   ├── admin/           # Panel de administración
    │   │   ├── dashboard.html
    │   │   ├── usuarios.html
    │   │   ├── roles.html
    │   │   ├── categorias.html
    │   │   └── productos.html
    │   └── client/          # Panel de cliente
    │       ├── dashboard.html
    │       └── cart.html
    ├── js/                  # Lógica JavaScript modular
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── admin-*.js       # Scripts por módulo
    │   └── cart.js
    ├── css/
    │   └── styles.css       # Estilos unificados (2600+ líneas)
    ├── static/              # Imágenes y recursos
    ├── index.html           # Login
    └── register.html        # Registro
```

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticación y Seguridad
- ✅ **Login con JWT**: Token Bearer almacenado en LocalStorage
- ✅ **Registro de usuarios**: Validación de campos y passwords
- ✅ **Validación de sesión**: Middleware que verifica token en cada página
- ✅ **Control de roles**: Separación de permisos Administrador/Cliente
- ✅ **Logout seguro**: Limpieza de tokens y redirección

### 👤 Gestión de Usuarios (Admin)
- ✅ **CRUD completo** con tabla profesional
- ✅ **Búsqueda en tiempo real** por nombre/email/rol
- ✅ **Contador dinámico** de usuarios
- ✅ **Eliminación en cascada**: Carrito y Pedidos asociados
- ✅ **Workaround para findById**: Solución compatible con Hibernate 6.6
- ✅ **Estados visuales**: Badges de colores por rol
- ✅ **Logging detallado**: Consola con emojis para debugging

### 🏷️ Gestión de Roles (Admin)
- ✅ **CRUD completo** con diseño de tarjetas (cards)
- ✅ **Grid responsive** adaptable a pantalla
- ✅ **Búsqueda instantánea** por nombre
- ✅ **Estados vacíos** con mensajes amigables
- ✅ **Íconos personalizados** por tipo de rol

### 📦 Gestión de Categorías (Admin)
- ✅ **CRUD completo** con diseño de tarjetas
- ✅ **Grid moderno** con hover effects
- ✅ **Búsqueda en tiempo real**
- ✅ **Colores distintivos** por categoría
- ✅ **Cascada a productos**: Relación OneToMany

### 🛍️ Gestión de Productos (Admin)
- ✅ **CRUD completo** con tabla profesional
- ✅ **Búsqueda dual**: Por nombre/ID y categoría
- ✅ **Filtro por categoría**: Dropdown dinámico
- ✅ **Contador de productos** actualizado en tiempo real
- ✅ **Imágenes preview**: 60x60px con bordes redondeados
- ✅ **Stock con colores**: Verde (>10), Naranja (1-10), Rojo (0)
- ✅ **Eliminación en cascada**: CarritoDetalle y PedidoDetalle
- ✅ **Tags de categoría**: Pills con colores

### 🏪 Catálogo de Productos (Cliente)
- ✅ **Grid responsive** de productos
- ✅ **Búsqueda en tiempo real** por nombre
- ✅ **Filtros avanzados funcionales**:
  - 💰 **Precio**: Slider con display visual + inputs min/max
  - 👟 **Tallas**: Checkboxes que buscan en descripción (35-42)
  - 🏷️ **Categorías**: Botones en navbar y sidebar
- ✅ **Filtros combinados**: Trabajan simultáneamente
- ✅ **Botón "Limpiar Filtros"**: Reset completo con un clic
- ✅ **Modal de detalles**: Vista ampliada del producto
- ✅ **Agregar al carrito**: Integración con API
- ✅ **Notificaciones toast**: Feedback visual de acciones
- ✅ **Placeholder para imágenes**: Fallback automático
- ✅ **Contador de carrito**: Badge con cantidad de items

### 🛒 Carrito de Compras (Cliente)
- ✅ **Panel lateral deslizante** con overlay
- ✅ **Lista de items**: Imagen, nombre, precio, cantidad
- ✅ **Actualizar cantidad**: Botones +/- en tiempo real
- ✅ **Eliminar items**: Con confirmación
- ✅ **Cálculo automático**: Subtotal, IVA (19%), Total
- ✅ **Sincronización**: Actualización tras cada cambio
- ✅ **Animaciones suaves**: Transiciones CSS
- ✅ **Contador en navbar**: Badge actualizado automáticamente

### 📊 Dashboard Administrativo
- ✅ **Cards de métricas**: Usuarios, Productos, Categorías, Roles
- ✅ **Navegación rápida**: Botones a cada módulo
- ✅ **Diseño moderno**: Gradientes y sombras
- ✅ **Menú lateral**: Navegación entre módulos
- ✅ **Botón de logout**: Siempre visible

### 🎨 Interfaz de Usuario
- ✅ **Diseño responsive**: Desktop, tablet y móvil
- ✅ **Tema coherente**: Paleta de colores unificada
- ✅ **Gradientes modernos**: Efectos visuales atractivos
- ✅ **Hover effects**: Feedback visual en elementos interactivos
- ✅ **Loading states**: Indicadores de carga
- ✅ **Empty states**: Mensajes cuando no hay datos
- ✅ **Error handling**: Mensajes de error amigables

---

## ⚙️ Instalación y Configuración

### Prerequisitos
- Java 17 o superior
- Maven 3.8+
- PostgreSQL 13+ o MySQL 8+
- Navegador web moderno (Chrome, Firefox, Edge)
- Git

### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/JuanSe2731/Proyecto-Spring-Boot-E-converse.git
cd Proyecto-Spring-Boot-E-converse
```

### 2️⃣ Configurar Base de Datos

**Opción A: PostgreSQL (Recomendado)**
```sql
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
```

**Opción B: MySQL**
```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3️⃣ Configurar application.properties

Edita `backend/src/main/resources/application.properties`:

**Para PostgreSQL:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce_db
spring.datasource.username=ecommerce_user
spring.datasource.password=tu_password
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

jwt.secret=tu_clave_secreta_super_segura_minimo_256_bits
jwt.expiration=86400000
```

**Para MySQL:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=ecommerce_user
spring.datasource.password=tu_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

jwt.secret=tu_clave_secreta_super_segura_minimo_256_bits
jwt.expiration=86400000
```

### 4️⃣ Compilar y Ejecutar Backend

```bash
cd backend

# Compilar
./mvnw clean install

# Ejecutar
./mvnw spring-boot:run
```

El servidor estará disponible en: `http://localhost:8080`

### 5️⃣ Ejecutar Frontend

**Opción A: Live Server (VS Code)**
1. Instala la extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"
3. Se abrirá en `http://localhost:5500` o `http://127.0.0.1:5500`

**Opción B: Servidor HTTP Python**
```bash
cd frontend
python -m http.server 5500
```

**Opción C: Servidor HTTP Node.js**
```bash
npx http-server -p 5500
```

### 6️⃣ Datos Iniciales

Al ejecutar por primera vez, **es necesario crear manualmente** en la base de datos:

**Roles iniciales:**
```sql
INSERT INTO rol (nombre) VALUES 
('Administrador'),
('Cliente');
```

**Usuario administrador inicial:**
```sql
-- Password: admin123 (encriptado con BCrypt)
INSERT INTO usuario (nombre, apellido, email, password, telefono, direccion, rol_id) VALUES
('Admin', 'Sistema', 'admin@ecommerce.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '1234567890', 'Oficina Central', 1);
```

**Categorías iniciales:**
```sql
INSERT INTO categoria (nombre) VALUES 
('Deportivos'),
('Casuales'),
('Formales'),
('Running');
```

---

## 🎯 Uso del Sistema

### Como Administrador

1. **Login**: `admin@ecommerce.com` / `admin123`
2. **Dashboard**: Visualiza métricas generales
3. **Usuarios**: Gestiona clientes y administradores
4. **Roles**: Crea y edita roles del sistema
5. **Categorías**: Organiza productos por categorías
6. **Productos**: CRUD completo con filtros y búsqueda

### Como Cliente

1. **Registro**: Crea tu cuenta desde la página principal
2. **Login**: Ingresa con tu email y contraseña
3. **Catálogo**: Navega y filtra productos
4. **Filtros**: 
   - Mueve el slider de precio
   - Selecciona tallas (deben estar en descripción)
   - Filtra por categoría
5. **Carrito**: Agrega productos y ajusta cantidades
6. **Pedido**: ⚠️ Pendiente de implementación

---

## 🔒 Seguridad Implementada

- ✅ **JWT (JSON Web Tokens)**: Autenticación stateless
- ✅ **BCrypt**: Hashing de contraseñas
- ✅ **CORS**: Configurado para desarrollo local
- ✅ **Roles y permisos**: Separación de accesos
- ✅ **Validación de sesión**: En cada petición al backend
- ✅ **Sanitización de inputs**: Frontend y backend
- ✅ **HttpOnly cookies**: Considerado para producción

---

## 🔧 Endpoints API REST

### Autenticación (`/auth`)
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/user-info` - Obtener datos del usuario autenticado

### Usuarios (`/usuario`) 🔐 Admin
- `GET /usuario/list` - Listar todos
- `GET /usuario/list/{id}` - Buscar por ID
- `POST /usuario/new` - Crear usuario
- `PUT /usuario/update` - Actualizar usuario
- `DELETE /usuario/delete/{id}` - Eliminar usuario

### Roles (`/roles`) 🔐 Admin
- `GET /roles/list` - Listar todos
- `GET /roles/list/{id}` - Buscar por ID
- `POST /roles/new` - Crear rol
- `PUT /roles/update` - Actualizar rol
- `DELETE /roles/delete/{id}` - Eliminar rol

### Categorías (`/categorias`) 🔐 Admin
- `GET /categorias/list` - Listar todas
- `GET /categorias/list/{id}` - Buscar por ID
- `POST /categorias/new` - Crear categoría
- `PUT /categorias/update` - Actualizar categoría
- `DELETE /categorias/delete/{id}` - Eliminar categoría

### Productos (`/productos`)
- `GET /productos/list` - Listar todos (público)
- `GET /productos/list/{id}` - Buscar por ID (público)
- `POST /productos/new` - Crear producto 🔐 Admin
- `PUT /productos/update` - Actualizar producto 🔐 Admin
- `DELETE /productos/delete/{id}` - Eliminar producto 🔐 Admin

### Carrito (`/carrito`) 🔐 Cliente
- `GET /carrito/mis-items` - Obtener items del carrito
- `POST /carrito/agregar` - Agregar producto
- `PUT /carrito/actualizar/{id}` - Actualizar cantidad
- `DELETE /carrito/eliminar/{id}` - Eliminar item
- `GET /carrito/total` - Calcular total

### Pedidos (`/pedidos`) 🔐 Cliente
- ⚠️ **Pendiente de implementación**

---

## 🚧 Pendiente de Implementación

### Alta Prioridad
- 🔲 **Módulo de Pedidos completo**:
  - Crear pedido desde carrito
  - Historial de pedidos del cliente
  - Estados del pedido (Pendiente, En Proceso, Enviado, Entregado)
  - CRUD de pedidos para administrador
  - Detalles de pedido con items

- 🔲 **Vista de Carrito mejorada**:
  - Página dedicada para el carrito (además del sidebar)
  - Validación de stock antes de proceder al pago
  - Cálculo de envío
  - Aplicar cupones de descuento

### Media Prioridad
- 🔲 **Dashboard de reportes**:
  - Productos más vendidos
  - Gráficas de ventas por período
  - Clientes más activos
  - Ingresos mensuales

- 🔲 **Gestión de stock**:
  - Alertas de stock bajo
  - Historial de movimientos
  - Ajuste de inventario

- 🔲 **Notificaciones**:
  - Email de confirmación de registro
  - Email de confirmación de pedido
  - Notificaciones en tiempo real

### Baja Prioridad (Mejoras)
- 🔲 **Recuperación de contraseña**:
  - Envío de email con token
  - Formulario de reset

- 🔲 **Perfil de usuario**:
  - Editar datos personales
  - Cambiar contraseña
  - Historial de compras

- 🔲 **Wishlist (Lista de deseos)**:
  - Guardar productos favoritos
  - Compartir lista

- 🔲 **Reseñas y valoraciones**:
  - Calificar productos
  - Comentarios de clientes

- 🔲 **Búsqueda avanzada**:
  - Filtros combinados más complejos
  - Autocompletado
  - Búsqueda por similitud

---

## 🐛 Problemas Conocidos y Soluciones

### ✅ Resueltos

1. **Error findById en Usuario**
   - **Problema**: Hibernate 6.6 devuelve Optional vacío
   - **Solución**: Workaround con findAll() + stream()

2. **Error eliminación de Usuario**
   - **Problema**: Foreign key constraint de Carrito y Pedido
   - **Solución**: Cascada CascadeType.ALL + orphanRemoval

3. **Error eliminación de Producto**
   - **Problema**: Foreign key de CarritoDetalle y PedidoDetalle
   - **Solución**: @OneToMany con cascade + @JsonIgnore

4. **Error creación de Producto**
   - **Problema**: Campo 'estado' no existe en modelo
   - **Solución**: Eliminado de BD y código

### ⚠️ Por resolver

1. **Sesión no persiste en refresh**
   - **Problema**: Token se pierde al recargar
   - **Solución propuesta**: Verificar localStorage en cada carga

2. **Imágenes de productos**
   - **Problema**: Rutas relativas no funcionan correctamente
   - **Solución temporal**: URLs absolutas o placeholder

---

## 📚 Documentación Adicional

### Modelo de Base de Datos

**Entidades principales:**
- `Usuario` (1) → (N) `Carrito` → (N) `CarritoDetalle`
- `Usuario` (1) → (N) `Pedido` → (N) `PedidoDetalle`
- `Categoria` (1) → (N) `Producto`
- `Producto` (1) → (N) `CarritoDetalle`
- `Producto` (1) → (N) `PedidoDetalle`
- `Rol` (1) → (N) `Usuario`

### Convenciones de Código

**Backend:**
- Nombres de clases: PascalCase
- Nombres de métodos: camelCase
- Nombres de variables: camelCase
- Logging con emojis para debugging

**Frontend:**
- Nombres de archivos: kebab-case
- Nombres de funciones: camelCase
- Nombres de variables: camelCase
- Comentarios con emojis para secciones

---

## 👥 Equipo de Desarrollo

**Desarrolladores:**
- Juan Sebastián Otero  - 2220053
- Daniel Santiago Convers  - 2221120
- Juan David Paipa  - 2220062
- Jhon Anderson Vargas  - 2220086

**Institución:**
- Universidad Industrial de Santander

**Curso:**
- Entornos de Programacion C1

**Período:**
- 2025

---

## 📝 Licencia

Este proyecto es de carácter **académico** y está desarrollado con fines educativos.

---

## 🙏 Agradecimientos

- Spring Boot Community
- Stack Overflow
- Font Awesome
- PostgreSQL & MySQL Communities
- Todos los profesores y compañeros que aportaron feedback

---

## 📞 Contacto

Para preguntas o sugerencias sobre el proyecto:

- **GitHub**: [@JuanSe2731](https://github.com/JuanSe2731)

---

## 🎓 Notas del Proyecto

Este sistema de e-commerce fue desarrollado como proyecto académico, implementando:
- ✅ Arquitectura MVC completa
- ✅ API REST con Spring Boot
- ✅ Autenticación JWT
- ✅ Frontend con JavaScript vanilla
- ✅ Base de datos relacional normalizada
- ✅ CRUD completo para todas las entidades
- ✅ Interfaz responsive y moderna

**Estado actual**: 🟡 **En desarrollo activo** (85% completado)

Las funcionalidades core están implementadas y funcionando. Pendiente: módulo completo de pedidos y mejoras en reportes.

---

**⭐ Si este proyecto te resultó útil, no olvides darle una estrella en GitHub!**
