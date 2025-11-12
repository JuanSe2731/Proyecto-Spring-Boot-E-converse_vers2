const API_BASE_URL = 'http://localhost:8080';

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando gestión de categorías');
    await validarSesionAdmin();
    await cargarCategorias();
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

// Cargar todas las categorías
async function cargarCategorias() {
    const token = localStorage.getItem('token');
    console.log('📋 Cargando categorías...');

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            categoriasCache = await response.json();
            console.log('✅ Categorías cargadas:', categoriasCache.length);
            mostrarCategorias(categoriasCache);
        } else {
            console.error('❌ Error al cargar categorías:', response.status);
            alert('Error al cargar categorías');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar categorías');
    }
}

// Mostrar categorías en grid
function mostrarCategorias(categorias) {
    const grid = document.getElementById('categorias-grid');
    const emptyMessage = document.getElementById('empty-message');
    grid.innerHTML = '';

    if (categorias.length === 0) {
        grid.style.display = 'none';
        emptyMessage.style.display = 'flex';
        return;
    }

    grid.style.display = 'grid';
    emptyMessage.style.display = 'none';

    categorias.forEach(categoria => {
        const card = document.createElement('div');
        card.className = 'crud-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon categoria-icon">
                    <i class="fas fa-tag"></i>
                </div>
                <div class="card-info">
                    <h3>${categoria.nombre}</h3>
                    <span class="card-id">ID: ${categoria.idCategoria}</span>
                    ${categoria.descripcion ? `<p class="card-description">${categoria.descripcion}</p>` : ''}
                </div>
            </div>
            <div class="card-actions">
                <button onclick="editarCategoria(${categoria.idCategoria})" class="btn-icon btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarCategoria(${categoria.idCategoria}, '${categoria.nombre.replace(/'/g, "\\'")}')" 
                        class="btn-icon btn-delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Función de búsqueda
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarCategorias);
    }
});

let categoriasCache = [];

function filtrarCategorias() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoriasFiltradas = categoriasCache.filter(cat => 
        cat.nombre.toLowerCase().includes(searchTerm) ||
        cat.idCategoria.toString().includes(searchTerm) ||
        (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm))
    );
    mostrarCategorias(categoriasFiltradas);
}

// Mostrar modal para crear/editar
function mostrarModal(categoria = null) {
    const modal = document.getElementById('categoria-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('categoria-form');
    
    if (categoria) {
        console.log('✏️ Editando categoría:', categoria);
        modalTitle.textContent = 'Editar Categoría';
        document.getElementById('categoria-id').value = categoria.idCategoria;
        document.getElementById('categoria-nombre').value = categoria.nombre;
        document.getElementById('categoria-descripcion').value = categoria.descripcion || '';
    } else {
        console.log('➕ Creando nueva categoría');
        modalTitle.textContent = 'Nueva Categoría';
        form.reset();
        document.getElementById('categoria-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById('categoria-modal');
    modal.style.display = 'none';
    document.getElementById('categoria-form').reset();
}

// Editar categoría
async function editarCategoria(id) {
    const token = localStorage.getItem('token');
    console.log('🔍 Buscando categoría ID:', id);

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/list/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const categoria = await response.json();
            console.log('✅ Categoría encontrada:', categoria);
            mostrarModal(categoria);
        } else {
            alert('Error al cargar la categoría');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar la categoría');
    }
}

// Guardar categoría (crear o actualizar)
document.getElementById('categoria-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const id = document.getElementById('categoria-id').value;
    const nombre = document.getElementById('categoria-nombre').value.trim();
    const descripcion = document.getElementById('categoria-descripcion').value.trim();

    if (!nombre) {
        alert('El nombre es obligatorio');
        return;
    }

    const categoria = {
        nombre: nombre,
        descripcion: descripcion || null
    };

    if (id) {
        categoria.idCategoria = parseInt(id);
    }

    const url = id 
        ? `${API_BASE_URL}/categorias/update` 
        : `${API_BASE_URL}/categorias/new`;
    const method = id ? 'PUT' : 'POST';

    console.log(`${id ? '🔄' : '➕'} ${id ? 'Actualizando' : 'Creando'} categoría:`, categoria);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoria)
        });

        if (response.ok) {
            console.log('✅ Categoría guardada exitosamente');
            alert(id ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente');
            cerrarModal();
            await cargarCategorias();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert('Error al guardar la categoría: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al guardar la categoría: ' + error.message);
    }
});

// Eliminar categoría
async function eliminarCategoria(id, nombre) {
    console.log('🗑️ Intentando eliminar categoría:', id, nombre);
    
    if (!confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?\n\nADVERTENCIA: Esto también eliminará todos los productos asociados a esta categoría.`)) {
        console.log('❌ Eliminación cancelada');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📡 Respuesta:', response.status);

        if (response.ok) {
            console.log('✅ Categoría eliminada exitosamente');
            alert('Categoría eliminada exitosamente');
            await cargarCategorias();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert('Error al eliminar categoría: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al eliminar la categoría: ' + error.message);
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
    const modal = document.getElementById('categoria-modal');
    if (event.target === modal) {
        cerrarModal();
    }
};
