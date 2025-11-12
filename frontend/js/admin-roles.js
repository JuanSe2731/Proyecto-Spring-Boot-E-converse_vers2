const API_BASE_URL = 'http://localhost:8080';

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando gestión de roles');
    await validarSesionAdmin();
    await cargarRoles();
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

// Cargar todos los roles
async function cargarRoles() {
    const token = localStorage.getItem('token');
    console.log('📋 Cargando roles...');

    try {
        const response = await fetch(`${API_BASE_URL}/roles/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            rolesCache = await response.json();
            console.log('✅ Roles cargados:', rolesCache.length);
            mostrarRoles(rolesCache);
        } else {
            console.error('❌ Error al cargar roles:', response.status);
            alert('Error al cargar roles');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar roles');
    }
}

// Mostrar roles en grid
function mostrarRoles(roles) {
    const grid = document.getElementById('roles-grid');
    const emptyMessage = document.getElementById('empty-message');
    grid.innerHTML = '';

    if (roles.length === 0) {
        grid.style.display = 'none';
        emptyMessage.style.display = 'flex';
        return;
    }

    grid.style.display = 'grid';
    emptyMessage.style.display = 'none';

    roles.forEach(rol => {
        const card = document.createElement('div');
        card.className = 'crud-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="card-info">
                    <h3>${rol.nombre}</h3>
                    <span class="card-id">ID: ${rol.idRol}</span>
                </div>
            </div>
            <div class="card-actions">
                <button onclick="editarRol(${rol.idRol})" class="btn-icon btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarRol(${rol.idRol}, '${rol.nombre}')" 
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
        searchInput.addEventListener('input', filtrarRoles);
    }
});

let rolesCache = [];

async function cargarRolesOriginal() {
    const token = localStorage.getItem('token');
    console.log('📋 Cargando roles...');

    try {
        const response = await fetch(`${API_BASE_URL}/roles/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            rolesCache = await response.json();
            console.log('✅ Roles cargados:', rolesCache.length);
            mostrarRoles(rolesCache);
        } else {
            console.error('❌ Error al cargar roles:', response.status);
            alert('Error al cargar roles');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar roles');
    }
}

function filtrarRoles() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const rolesFiltrados = rolesCache.filter(rol => 
        rol.nombre.toLowerCase().includes(searchTerm) ||
        rol.idRol.toString().includes(searchTerm)
    );
    mostrarRoles(rolesFiltrados);
}

// Mostrar modal para crear/editar
function mostrarModal(rol = null) {
    const modal = document.getElementById('rol-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('rol-form');
    
    if (rol) {
        console.log('✏️ Editando rol:', rol);
        modalTitle.textContent = 'Editar Rol';
        document.getElementById('rol-id').value = rol.idRol;
        document.getElementById('rol-nombre').value = rol.nombre;
    } else {
        console.log('➕ Creando nuevo rol');
        modalTitle.textContent = 'Nuevo Rol';
        form.reset();
        document.getElementById('rol-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById('rol-modal');
    modal.style.display = 'none';
    document.getElementById('rol-form').reset();
}

// Editar rol
async function editarRol(id) {
    const token = localStorage.getItem('token');
    console.log('🔍 Buscando rol ID:', id);

    try {
        const response = await fetch(`${API_BASE_URL}/roles/list/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const rol = await response.json();
            console.log('✅ Rol encontrado:', rol);
            mostrarModal(rol);
        } else {
            alert('Error al cargar el rol');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar el rol');
    }
}

// Guardar rol (crear o actualizar)
document.getElementById('rol-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const id = document.getElementById('rol-id').value;
    const nombre = document.getElementById('rol-nombre').value.trim();

    if (!nombre) {
        alert('El nombre es obligatorio');
        return;
    }

    const rol = {
        nombre: nombre
    };

    if (id) {
        rol.idRol = parseInt(id);
    }

    const url = id 
        ? `${API_BASE_URL}/roles/update` 
        : `${API_BASE_URL}/roles/new`;
    const method = id ? 'PUT' : 'POST';

    console.log(`${id ? '🔄' : '➕'} ${id ? 'Actualizando' : 'Creando'} rol:`, rol);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(rol)
        });

        if (response.ok) {
            console.log('✅ Rol guardado exitosamente');
            alert(id ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
            cerrarModal();
            await cargarRoles();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert('Error al guardar el rol: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al guardar el rol: ' + error.message);
    }
});

// Eliminar rol
async function eliminarRol(id, nombre) {
    console.log('🗑️ Intentando eliminar rol:', id, nombre);
    
    if (!confirm(`¿Estás seguro de eliminar el rol "${nombre}"?\n\nADVERTENCIA: Esto puede afectar a los usuarios que tienen este rol asignado.`)) {
        console.log('❌ Eliminación cancelada');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/roles/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📡 Respuesta:', response.status);

        if (response.ok) {
            console.log('✅ Rol eliminado exitosamente');
            alert('Rol eliminado exitosamente');
            await cargarRoles();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert('Error al eliminar rol: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al eliminar el rol: ' + error.message);
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
    const modal = document.getElementById('rol-modal');
    if (event.target === modal) {
        cerrarModal();
    }
};
