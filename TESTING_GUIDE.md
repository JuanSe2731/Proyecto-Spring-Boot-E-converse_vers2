# 🧪 Guía de Pruebas - CRUDs Administrativos

Esta guía te ayudará a probar todos los CRUDs del panel de administración y verificar la conexión con el backend.

## 📋 Pre-requisitos

### 1. Backend debe estar corriendo
```bash
# En la carpeta backend
cd backend
mvn spring-boot:run
# o
./mvnw spring-boot:run

# El backend debe estar en: http://localhost:8080
```

### 2. Frontend debe estar corriendo
```bash
# En la carpeta frontend-react
cd frontend-react
npm start

# El frontend debe estar en: http://localhost:5174
```

### 3. Base de datos configurada
Verifica que tu archivo `backend/src/main/resources/application.properties` tenga la configuración correcta:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tu_base_de_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
```

---

## 🧪 Pruebas a Realizar

### 1. Verificar Conexión Inicial

#### a) Abrir el navegador
```
http://localhost:5174
```

#### b) Verificar que el dashboard público carga
- ✅ Deberías ver productos (si hay en la BD)
- ✅ Los filtros deben funcionar
- ✅ La búsqueda debe funcionar
- ✅ Debe haber un botón "Iniciar Sesión" en la navbar

---

### 2. Iniciar Sesión como Administrador

1. Clic en "Iniciar Sesión"
2. Usar credenciales de administrador:
   - **Email**: (tu usuario admin en la BD)
   - **Password**: (tu contraseña)

3. **Verificar redirección automática a `/admin`**

Si no tienes un usuario admin, créalo desde la base de datos:
```sql
-- Primero crear el rol si no existe
INSERT INTO rol (nombre, descripcion) VALUES ('Administrador', 'Rol con acceso completo');

-- Luego crear el usuario (ajusta el hash de la contraseña según tu configuración)
INSERT INTO usuario (nombre, correo, contrasena, id_rol, estado) 
VALUES ('Admin', 'admin@example.com', 'tu_password_hasheado', 1, true);
```

---

### 3. Pruebas del CRUD de Roles

**Ruta**: `/admin/roles`

#### ✅ **Crear Rol**
1. Clic en "Nuevo Rol"
2. Llenar formulario:
   - Nombre: "Cliente"
   - Descripción: "Usuario regular de la tienda"
3. Clic en "Crear"
4. **Verificar**: El rol aparece en la tabla

#### ✅ **Editar Rol**
1. Clic en el ícono de lápiz del rol creado
2. Modificar la descripción
3. Clic en "Actualizar"
4. **Verificar**: Los cambios se reflejan

#### ✅ **Eliminar Rol**
1. Clic en el ícono de basurero
2. Confirmar la eliminación
3. **Verificar**: El rol desaparece de la tabla

**Nota**: No podrás eliminar roles que estén siendo usados por usuarios.

---

### 4. Pruebas del CRUD de Categorías

**Ruta**: `/admin/categorias`

#### ✅ **Crear Categoría**
1. Clic en "Nueva Categoría"
2. Llenar formulario:
   - Nombre: "Deportivos"
   - Descripción: "Calzado para deportes"
3. Clic en "Crear"
4. **Verificar**: 
   - La categoría aparece en el grid de tarjetas
   - También aparece en la tabla inferior

#### ✅ **Editar Categoría**
1. Clic en "Editar" en una tarjeta o el ícono de lápiz en la tabla
2. Modificar el nombre
3. Clic en "Actualizar"
4. **Verificar**: Los cambios se reflejan en ambas vistas

#### ✅ **Eliminar Categoría**
1. Clic en "Eliminar"
2. Confirmar la eliminación
3. **Verificar**: La categoría desaparece

**Crea al menos 3 categorías** para las siguientes pruebas:
- Deportivos
- Casuales
- Formales

---

### 5. Pruebas del CRUD de Productos

**Ruta**: `/admin/productos`

#### ✅ **Crear Producto**
1. Clic en "Nuevo Producto"
2. Llenar formulario:
   - **Nombre**: "Nike Air Max 270"
   - **Descripción**: "Zapatillas deportivas con tecnología Air Max. Disponibles en tallas: 38, 39, 40, 41, 42"
   - **Precio**: 299990
   - **Stock**: 50
   - **Categoría**: Deportivos
   - **URL Imagen**: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500`
3. Clic en "Crear"
4. **Verificar**: 
   - El producto aparece en el grid
   - La imagen se muestra correctamente
   - La vista previa funciona en el formulario

#### ✅ **Filtrar Productos**
1. Crear productos de diferentes categorías
2. Usar el selector de categorías
3. **Verificar**: Solo se muestran productos de la categoría seleccionada

#### ✅ **Buscar Productos**
1. Escribir en el campo de búsqueda
2. **Verificar**: Los productos se filtran en tiempo real

#### ✅ **Editar Producto**
1. Clic en "Editar" en una tarjeta
2. Modificar el precio o stock
3. Clic en "Actualizar"
4. **Verificar**: Los cambios se reflejan

#### ✅ **Eliminar Producto**
1. Clic en "Eliminar"
2. Confirmar
3. **Verificar**: El producto desaparece

**Crea al menos 5 productos** con diferentes categorías e imágenes.

---

### 6. Pruebas del CRUD de Usuarios

**Ruta**: `/admin/usuarios`

#### ✅ **Crear Usuario**
1. Clic en "Nuevo Usuario"
2. Llenar formulario:
   - **Nombre**: "Juan Pérez"
   - **Email**: "juan@example.com"
   - **Contraseña**: "123456" (mínimo 6 caracteres)
   - **Rol**: Cliente
   - **Dirección**: "Calle 123 #45-67" (opcional)
   - **Estado**: ✓ Activo
3. Clic en "Crear"
4. **Verificar**: El usuario aparece en la tabla

#### ✅ **Editar Usuario**
1. Clic en el ícono de lápiz
2. Modificar:
   - Cambiar el rol
   - Modificar el estado (activo/inactivo)
   - **Nota**: El correo NO se puede modificar
3. Clic en "Actualizar"
4. **Verificar**: Los cambios se reflejan

#### ✅ **Buscar Usuario**
1. Escribir en el campo de búsqueda (nombre o email)
2. **Verificar**: La tabla se filtra correctamente

#### ✅ **Eliminar Usuario**
1. Clic en el ícono de basurero
2. Confirmar
3. **Verificar**: El usuario desaparece

---

### 7. Verificar Dashboard del Cliente

1. Cerrar sesión
2. Ir a `/dashboard`
3. **Verificar**:
   - Los productos recién creados aparecen
   - Los filtros por categoría funcionan
   - Los filtros por precio funcionan
   - Los filtros por talla funcionan (si agregaste tallas en la descripción)
   - Clic en un producto abre el modal de detalles

---

### 8. Verificar Funcionalidad del Carrito

1. Iniciar sesión como cliente
2. Ir al dashboard
3. Clic en "Agregar" en un producto
4. **Verificar**:
   - Aparece notificación de éxito
   - El contador del carrito aumenta
5. Clic en el ícono del carrito
6. **Verificar**:
   - Se abre el panel lateral
   - El producto está en la lista
   - Los totales se calculan correctamente (subtotal, IVA, total)
7. Incrementar/Decrementar cantidad
8. **Verificar**: Los totales se actualizan
9. Eliminar producto del carrito
10. **Verificar**: El carrito se vacía

---

## 🐛 Problemas Comunes y Soluciones

### Error: "CORS policy"
**Solución**: Verifica que el backend tenga configurado CORS:
```java
// En CorsConfig.java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173", "http://localhost:5174")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
}
```

### Error: "Network Error" o "ERR_CONNECTION_REFUSED"
**Solución**: Verifica que el backend esté corriendo en el puerto 8080:
```bash
# Verificar en terminal
netstat -ano | findstr :8080
```

### Error: "Unauthorized" (401)
**Solución**: 
- El token expiró, vuelve a iniciar sesión
- Verifica que el JWT esté configurado correctamente en el backend

### Error: "No se encontraron productos"
**Solución**: Verifica que haya productos en la base de datos:
```sql
SELECT * FROM producto;
```

### Imágenes no se muestran
**Solución**: 
- Usa URLs públicas de imágenes (ej: Unsplash, Imgur)
- O configura un servidor de archivos estáticos en el backend

---

## ✅ Checklist Final

### Backend
- [ ] Backend corriendo en puerto 8080
- [ ] Base de datos conectada
- [ ] CORS configurado
- [ ] Al menos 1 usuario administrador creado

### Frontend
- [ ] Frontend corriendo en puerto 5174
- [ ] Dashboard público funcional
- [ ] Login funcional
- [ ] Redirección por roles funciona

### CRUDs
- [ ] CRUD de Roles - Crear ✓
- [ ] CRUD de Roles - Editar ✓
- [ ] CRUD de Roles - Eliminar ✓
- [ ] CRUD de Categorías - Crear ✓
- [ ] CRUD de Categorías - Editar ✓
- [ ] CRUD de Categorías - Eliminar ✓
- [ ] CRUD de Productos - Crear ✓
- [ ] CRUD de Productos - Editar ✓
- [ ] CRUD de Productos - Eliminar ✓
- [ ] CRUD de Productos - Filtros ✓
- [ ] CRUD de Usuarios - Crear ✓
- [ ] CRUD de Usuarios - Editar ✓
- [ ] CRUD de Usuarios - Eliminar ✓

### Funcionalidades
- [ ] Dashboard público muestra productos
- [ ] Filtros funcionan correctamente
- [ ] Agregar al carrito funciona
- [ ] Carrito lateral se abre
- [ ] Cálculo de totales correcto
- [ ] Modificar cantidades funciona
- [ ] Eliminar del carrito funciona

---

## 📸 Capturas Recomendadas

Toma capturas de pantalla de:
1. Dashboard público con productos
2. Panel de admin con las 4 tarjetas
3. Cada CRUD (Roles, Categorías, Productos, Usuarios)
4. Carrito lateral con productos
5. Modal de formulario de producto con vista previa de imagen

---

## 🎉 ¡Todo Listo!

Si todos los puntos del checklist están marcados, tu aplicación está funcionando correctamente y lista para desarrollo adicional.

**Próximos pasos sugeridos**:
1. Implementar proceso de checkout
2. Agregar historial de pedidos
3. Mejorar validaciones de formularios
4. Agregar paginación en las tablas
5. Implementar carga de imágenes desde el cliente
