const API_BASE_URL = 'http://localhost:8080';

let usuarios = [];
let roles = [];
let editandoUsuarioId = null;

// Validar sesión de administrador
function validateAdminSession() {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || !userData.rol || userData.rol.nombre !== 'Administrador') {
        alert('No tienes permisos para acceder a esta página');
        window.location.href = '../../views/client/dashboard.html';
        return false;
    }
    return true;
}

// Cargar usuarios
async function cargarUsuarios() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/usuario/list`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            usuarios = await response.json();
            renderizarUsuarios(usuarios);
        } else {
            console.error('Error al cargar usuarios');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los usuarios');
    }
}

// Renderizar tabla de usuarios
function renderizarUsuarios(usuariosData) {
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = '';

    if (usuariosData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay usuarios registrados</td></tr>';
        return;
    }

    usuariosData.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.idUsuario}</td>
            <td>${usuario.nombre || '-'}</td>
            <td>${usuario.correo}</td>
            <td><span class="badge badge-${usuario.rol?.nombre?.toLowerCase() || 'default'}">${usuario.rol?.nombre || 'Sin rol'}</span></td>
            <td><span class="badge badge-${usuario.estado ? 'success' : 'danger'}">${usuario.estado ? 'Activo' : 'Inactivo'}</span></td>
            <td class="action-buttons">
                <button onclick="editarUsuario(${usuario.idUsuario})" class="btn-icon btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarUsuario(${usuario.idUsuario}, '${usuario.correo}')" class="btn-icon btn-delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Cargar roles disponibles
async function cargarRoles() {
    try {
        const token = localStorage.getItem('token');
        console.log('🔍 Cargando roles desde:', `${API_BASE_URL}/roles/list`);
        
        const response = await fetch(`${API_BASE_URL}/roles/list`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 Respuesta de roles:', response.status, response.statusText);

        if (response.ok) {
            roles = await response.json();
            console.log('✅ Roles cargados:', roles);
            
            const select = document.getElementById('usuario-rol');
            select.innerHTML = '<option value="">Seleccionar rol...</option>';
            roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.idRol;
                option.textContent = rol.nombre;
                select.appendChild(option);
            });
            console.log('✅ Dropdown de roles actualizado con', roles.length, 'opciones');
        } else {
            const errorText = await response.text();
            console.error('❌ Error al cargar roles:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Excepción al cargar roles:', error);
    }
}

// Mostrar modal para crear usuario
function mostrarModalCrear() {
    editandoUsuarioId = null;
    document.getElementById('modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('usuario-form').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuario-estado').checked = true;
    document.getElementById('usuario-contrasena').required = true;
    document.getElementById('usuario-modal').style.display = 'flex';
}

// Editar usuario
function editarUsuario(id) {
    console.log('🔧 Editando usuario con ID:', id);
    const usuario = usuarios.find(u => u.idUsuario === id);
    if (!usuario) {
        console.error('❌ Usuario no encontrado en la lista con ID:', id);
        return;
    }

    editandoUsuarioId = id;
    console.log('✅ editandoUsuarioId asignado:', editandoUsuarioId);
    console.log('📋 Datos del usuario a editar:', usuario);
    
    document.getElementById('modal-title').textContent = 'Editar Usuario';
    document.getElementById('usuario-id').value = usuario.idUsuario;
    document.getElementById('usuario-nombre').value = usuario.nombre || '';
    document.getElementById('usuario-correo').value = usuario.correo;
    document.getElementById('usuario-contrasena').value = '';
    document.getElementById('usuario-contrasena').required = false;
    document.getElementById('usuario-rol').value = usuario.rol?.idRol || '';
    document.getElementById('usuario-direccion').value = usuario.direccion || '';
    document.getElementById('usuario-estado').checked = usuario.estado;
    document.getElementById('usuario-modal').style.display = 'flex';
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('usuario-modal').style.display = 'none';
    document.getElementById('usuario-form').reset();
    editandoUsuarioId = null;
}

// Guardar usuario (crear o actualizar)
document.getElementById('usuario-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const rolId = parseInt(document.getElementById('usuario-rol').value);
    
    const usuarioData = {
        nombre: document.getElementById('usuario-nombre').value,
        correo: document.getElementById('usuario-correo').value,
        direccion: document.getElementById('usuario-direccion').value,
        estado: document.getElementById('usuario-estado').checked,
        rol: {
            idRol: rolId
        }
    };

    const contrasena = document.getElementById('usuario-contrasena').value;
    if (contrasena && contrasena.trim() !== '') {
        usuarioData.contrasena = contrasena;
    }

    try {
        const token = localStorage.getItem('token');
        
        console.log('🔍 Estado de editandoUsuarioId antes de enviar:', editandoUsuarioId);
        
        const url = editandoUsuarioId 
            ? `${API_BASE_URL}/usuario/update`
            : `${API_BASE_URL}/usuario/new`;

        if (editandoUsuarioId) {
            usuarioData.idUsuario = editandoUsuarioId;
            console.log('✅ idUsuario asignado al objeto:', usuarioData.idUsuario);
        } else {
            console.log('⚠️ editandoUsuarioId es null/undefined, creando usuario nuevo');
        }

        console.log('📤 Enviando usuario:', usuarioData);
        console.log('🔗 URL:', url);
        console.log('🔧 Método:', editandoUsuarioId ? 'PUT' : 'POST');

        const response = await fetch(url, {
            method: editandoUsuarioId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });

        console.log('📡 Respuesta del servidor:', response.status);

        if (response.ok) {
            alert(editandoUsuarioId ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
            cerrarModal();
            cargarUsuarios();
        } else {
            const error = await response.text();
            console.error('❌ Error del servidor:', error);
            
            if (response.status === 404) {
                alert('El usuario ya no existe. La lista se actualizará.');
                cerrarModal();
                cargarUsuarios(); // Recargar la lista para reflejar el estado real
            } else {
                alert('Error al guardar usuario: ' + error);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el usuario');
    }
});

// Eliminar usuario
async function eliminarUsuario(id, correo) {
    console.log('🗑️ Intentando eliminar usuario:', id, correo);
    
    if (!confirm(`¿Estás seguro de eliminar al usuario ${correo}?`)) {
        console.log('❌ Eliminación cancelada por el usuario');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        console.log('🔗 Enviando DELETE a:', `${API_BASE_URL}/usuario/delete/${id}`);
        
        const response = await fetch(`${API_BASE_URL}/usuario/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 Respuesta:', response.status);

        if (response.ok) {
            alert('Usuario eliminado exitosamente');
            cargarUsuarios();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert('Error al eliminar usuario: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Excepción:', error);
        alert('Error al eliminar el usuario: ' + error.message);
    }
}

// Búsqueda en tiempo real
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsuarios = usuarios.filter(usuario => 
        usuario.nombre?.toLowerCase().includes(searchTerm) ||
        usuario.correo.toLowerCase().includes(searchTerm) ||
        usuario.rol?.nombre?.toLowerCase().includes(searchTerm)
    );
    renderizarUsuarios(filteredUsuarios);
});

// Cerrar modal al hacer clic en el fondo oscuro (no en el contenido)
document.getElementById('usuario-modal').addEventListener('click', function(event) {
    // Solo cerrar si el clic fue directamente en el fondo del modal, no en el contenido
    if (event.target === this) {
        cerrarModal();
    }
});

// Cerrar sesión
function cerrarSesion() {
    localStorage.clear();
    window.location.href = '../../index.html';
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (validateAdminSession()) {
        cargarUsuarios();
        cargarRoles();
    }
});
