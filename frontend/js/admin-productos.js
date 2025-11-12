const API_BASE_URL = 'http://localhost:8080';

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando gestión de productos');
    await validarSesionAdmin();
    await cargarCategorias();
    await cargarProductos();
});

// Validar que el usuario sea administrador
async function validarSesionAdmin() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Debes iniciar sesión');
        window.location.href = '/index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/user-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert('Sesión expirada');
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return;
        }

        const userData = await response.json();
        
        if (!userData.rol || userData.rol.nombre !== 'Administrador') {
            alert('No tienes permisos de administrador');
            window.location.href = '/views/client/dashboard.html';
            return;
        }
    } catch (error) {
        console.error('❌ Error validando sesión:', error);
        window.location.href = '/index.html';
    }
}

// Variable global para almacenar productos
let productosCache = [];
let categoriasCache = [];

// Cargar categorías para el dropdown
async function cargarCategorias() {
    const token = localStorage.getItem('token');
    console.log('📦 Cargando categorías...');

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            categoriasCache = await response.json();
            console.log('✅ Categorías cargadas:', categoriasCache.length);
            
            // Llenar dropdown del formulario
            const selectForm = document.getElementById('producto-categoria');
            selectForm.innerHTML = '<option value="">Seleccionar categoría</option>';
            
            // Llenar filtro de categorías
            const selectFilter = document.getElementById('filter-categoria');
            selectFilter.innerHTML = '<option value="">Todas las categorías</option>';
            
            categoriasCache.forEach(categoria => {
                const optionForm = document.createElement('option');
                optionForm.value = categoria.idCategoria;
                optionForm.textContent = categoria.nombre;
                selectForm.appendChild(optionForm);
                
                const optionFilter = document.createElement('option');
                optionFilter.value = categoria.idCategoria;
                optionFilter.textContent = categoria.nombre;
                selectFilter.appendChild(optionFilter);
            });
            
            // Agregar event listener para el filtro
            selectFilter.addEventListener('change', filtrarProductos);
        } else {
            console.error('❌ Error al cargar categorías');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Cargar todos los productos
async function cargarProductos() {
    const token = localStorage.getItem('token');
    console.log('📋 Cargando productos...');

    try {
        const response = await fetch(`${API_BASE_URL}/productos/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            productosCache = await response.json();
            console.log('✅ Productos cargados:', productosCache.length);
            mostrarProductos(productosCache);
            actualizarContador(productosCache.length);
            
            // Agregar event listener para búsqueda
            const searchInput = document.getElementById('search-productos');
            if (searchInput) {
                searchInput.addEventListener('input', filtrarProductos);
            }
        } else {
            console.error('❌ Error al cargar productos:', response.status);
            alert('Error al cargar productos');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar productos');
    }
}

// Actualizar contador de productos
function actualizarContador(cantidad) {
    const contador = document.getElementById('total-productos');
    if (contador) {
        contador.textContent = cantidad;
    }
}

// Filtrar productos por búsqueda y categoría
function filtrarProductos() {
    const searchTerm = document.getElementById('search-productos').value.toLowerCase();
    const categoriaId = document.getElementById('filter-categoria').value;
    
    let productosFiltrados = productosCache;
    
    // Filtrar por búsqueda
    if (searchTerm) {
        productosFiltrados = productosFiltrados.filter(producto => 
            producto.nombre.toLowerCase().includes(searchTerm) ||
            producto.idProducto.toString().includes(searchTerm)
        );
    }
    
    // Filtrar por categoría
    if (categoriaId) {
        productosFiltrados = productosFiltrados.filter(producto => 
            producto.categoria && producto.categoria.idCategoria.toString() === categoriaId
        );
    }
    
    mostrarProductos(productosFiltrados);
    actualizarContador(productosFiltrados.length);
}

// Mostrar productos en la tabla
function mostrarProductos(productos) {
    const tbody = document.getElementById('productos-tbody');
    tbody.innerHTML = '';

    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>No se encontraron productos</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    productos.forEach(producto => {
        const tr = document.createElement('tr');
        tr.className = 'producto-row';
        
        const imagenHtml = producto.imagenUrl 
            ? `<div class="producto-imagen"><img src="${producto.imagenUrl}" alt="${producto.nombre}"></div>` 
            : '<div class="producto-imagen-placeholder"><i class="fas fa-image"></i></div>';
        
        tr.innerHTML = `
            <td class="td-id">${producto.idProducto}</td>
            <td class="td-imagen">${imagenHtml}</td>
            <td class="td-producto">
                <div class="producto-info">
                    <strong class="producto-nombre">${producto.nombre}</strong>
                    ${producto.descripcion ? `<span class="producto-desc">${producto.descripcion}</span>` : ''}
                </div>
            </td>
            <td class="td-categoria">
                <span class="categoria-tag">
                    <i class="fas fa-tag"></i>
                    ${producto.categoria ? producto.categoria.nombre : 'Sin categoría'}
                </span>
            </td>
            <td class="td-precio">
                <strong class="precio-valor">$${parseFloat(producto.precio).toFixed(2)}</strong>
            </td>
            <td class="td-stock">
                <span class="stock-badge ${producto.stock > 10 ? 'stock-alto' : producto.stock > 0 ? 'stock-medio' : 'stock-bajo'}">
                    <i class="fas fa-box"></i>
                    ${producto.stock} unid.
                </span>
            </td>
            <td class="td-acciones">
                <div class="acciones-grupo">
                    <button onclick="editarProducto(${producto.idProducto})" class="btn-icon btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarProducto(${producto.idProducto}, '${producto.nombre.replace(/'/g, "\\'")}')" 
                            class="btn-icon btn-delete" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Mostrar modal para crear/editar
function mostrarModal(producto = null) {
    const modal = document.getElementById('producto-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('producto-form');
    
    if (producto) {
        console.log('✏️ Editando producto:', producto);
        modalTitle.textContent = 'Editar Producto';
        document.getElementById('producto-id').value = producto.idProducto;
        document.getElementById('producto-nombre').value = producto.nombre;
        document.getElementById('producto-descripcion').value = producto.descripcion || '';
        document.getElementById('producto-precio').value = producto.precio;
        document.getElementById('producto-stock').value = producto.stock;
        document.getElementById('producto-imagen').value = producto.imagenUrl || '';
        document.getElementById('producto-categoria').value = producto.categoria ? producto.categoria.idCategoria : '';
    } else {
        console.log('➕ Creando nuevo producto');
        modalTitle.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('producto-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById('producto-modal');
    modal.style.display = 'none';
    document.getElementById('producto-form').reset();
}

// Editar producto
async function editarProducto(id) {
    const token = localStorage.getItem('token');
    console.log('🔍 Buscando producto ID:', id);

    try {
        const response = await fetch(`${API_BASE_URL}/productos/list/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const producto = await response.json();
            console.log('✅ Producto encontrado:', producto);
            mostrarModal(producto);
        } else {
            alert('Error al cargar el producto');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar el producto');
    }
}

// Guardar producto (crear o actualizar)
document.getElementById('producto-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const id = document.getElementById('producto-id').value;
    const nombre = document.getElementById('producto-nombre').value.trim();
    const descripcion = document.getElementById('producto-descripcion').value.trim();
    const precio = parseFloat(document.getElementById('producto-precio').value);
    const stock = parseInt(document.getElementById('producto-stock').value);
    const imagenUrl = document.getElementById('producto-imagen').value.trim();
    const categoriaId = document.getElementById('producto-categoria').value;

    if (!nombre || !categoriaId || precio < 0 || stock < 0) {
        alert('Por favor, completa todos los campos obligatorios correctamente');
        return;
    }

    const producto = {
        nombre: nombre,
        descripcion: descripcion || null,
        precio: precio,
        stock: stock,
        imagenUrl: imagenUrl || null,
        categoria: {
            idCategoria: parseInt(categoriaId)
        }
    };

    if (id) {
        producto.idProducto = parseInt(id);
    }

    const url = id 
        ? `${API_BASE_URL}/productos/update` 
        : `${API_BASE_URL}/productos/new`;
    const method = id ? 'PUT' : 'POST';

    console.log(`${id ? '🔄' : '➕'} ${id ? 'Actualizando' : 'Creando'} producto:`, producto);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(producto)
        });

        if (response.ok) {
            console.log('✅ Producto guardado exitosamente');
            alert(id ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
            cerrarModal();
            await cargarProductos();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert('Error al guardar el producto: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al guardar el producto: ' + error.message);
    }
});

// Eliminar producto
async function eliminarProducto(id, nombre) {
    console.log('🗑️ Intentando eliminar producto:', id, nombre);
    
    if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?\n\nADVERTENCIA: Esto también eliminará el producto de todos los carritos y pedidos.`)) {
        console.log('❌ Eliminación cancelada');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/productos/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📡 Respuesta:', response.status);

        if (response.ok) {
            console.log('✅ Producto eliminado exitosamente');
            alert('Producto eliminado exitosamente');
            await cargarProductos();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert('Error al eliminar producto: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al eliminar el producto: ' + error.message);
    }
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/index.html';
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('producto-modal');
    if (event.target === modal) {
        cerrarModal();
    }
};
