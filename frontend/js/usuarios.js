// =============================
// 🔧 USUARIOS.JS - CRUD DE USUARIOS
// =============================

const API_BASE_URL = "http://localhost:8080";
let currentEditingId = null;
let allUsers = [];

// -----------------------------
// 🔐 VALIDACIÓN DE SESIÓN ADMIN
// -----------------------------
async function validateAdminSession() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Debe iniciar sesión para acceder a esta página');
        window.location.href = '/index.html';
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/user-info`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert('Sesión inválida o expirada');
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return false;
        }

        const userData = await response.json();
        
        // Verificar que sea administrador
        if (!userData.rol || userData.rol.nombre !== 'ADMIN') {
            alert('No tiene permisos de administrador');
            window.location.href = '../client/dashboard.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validando sesión:', error);
        window.location.href = '/index.html';
        return false;
    }
}

// -----------------------------
// 📊 CARGAR USUARIOS
// -----------------------------
async function loadUsers() {
    const tableContent = document.getElementById('table-content');
    tableContent.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Cargando usuarios...</p></div>';

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/usuario/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar usuarios');

        allUsers = await response.json();
        renderTable(allUsers);
    } catch (error) {
        console.error('Error:', error);
        tableContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar los usuarios</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// -----------------------------
// 🎨 RENDERIZAR TABLA
// -----------------------------
function renderTable(users) {
    const tableContent = document.getElementById('table-content');
    
    if (users.length === 0) {
        tableContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No hay usuarios registrados</h3>
                <p>Comienza agregando un nuevo usuario</p>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(user => {
        tableHTML += `
            <tr>
                <td>${user.idUsuario}</td>
                <td>${user.nombre}</td>
                <td>${user.correo}</td>
                <td>${user.rol ? user.rol.nombre : 'Sin rol'}</td>
                <td>${user.direccion || 'N/A'}</td>
                <td><span class="badge ${user.estado ? 'badge-active' : 'badge-inactive'}">${user.estado ? 'Activo' : 'Inactivo'}</span></td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick='editUser(${JSON.stringify(user)})'>
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deleteUser(${user.idUsuario})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    tableContent.innerHTML = tableHTML;
}

// -----------------------------
// 🔍 BUSCAR USUARIOS
// -----------------------------
function searchUsers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filteredUsers = allUsers.filter(user => {
        return (
            user.nombre.toLowerCase().includes(searchTerm) ||
            user.correo.toLowerCase().includes(searchTerm) ||
            (user.rol && user.rol.nombre.toLowerCase().includes(searchTerm)) ||
            (user.direccion && user.direccion.toLowerCase().includes(searchTerm))
        );
    });

    renderTable(filteredUsers);
}

// -----------------------------
// 📥 CARGAR ROLES
// -----------------------------
async function loadRoles() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/rol/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar roles');

        const roles = await response.json();
        const rolSelect = document.getElementById('rol');
        
        rolSelect.innerHTML = '<option value="">Seleccione un rol</option>';
        roles.forEach(rol => {
            rolSelect.innerHTML += `<option value="${rol.idRol}">${rol.nombre}</option>`;
        });
    } catch (error) {
        console.error('Error cargando roles:', error);
        showNotification('error', 'Error al cargar los roles');
    }
}

// -----------------------------
// 📝 ABRIR MODAL
// -----------------------------
async function openModal(user = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modal-title');
    const passwordGroup = document.getElementById('password-group');
    const passwordInput = document.getElementById('contrasena');

    // Cargar roles
    await loadRoles();

    if (user) {
        // Modo edición
        currentEditingId = user.idUsuario;
        modalTitle.textContent = 'Editar Usuario';
        
        // Llenar el formulario
        document.getElementById('nombre').value = user.nombre;
        document.getElementById('correo').value = user.correo;
        document.getElementById('rol').value = user.rol ? user.rol.idRol : '';
        document.getElementById('direccion').value = user.direccion || '';
        document.getElementById('estado').value = user.estado.toString();

        // Ocultar campo de contraseña en edición
        passwordGroup.style.display = 'none';
        passwordInput.removeAttribute('required');
    } else {
        // Modo creación
        currentEditingId = null;
        modalTitle.textContent = 'Agregar Usuario';
        
        // Limpiar formulario
        document.getElementById('userForm').reset();
        
        // Mostrar campo de contraseña en creación
        passwordGroup.style.display = 'block';
        passwordInput.setAttribute('required', 'required');
    }

    modal.style.display = 'block';
}

// -----------------------------
// ❌ CERRAR MODAL
// -----------------------------
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    currentEditingId = null;
    document.getElementById('userForm').reset();
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        closeModal();
    }
}

// -----------------------------
// 💾 GUARDAR USUARIO
// -----------------------------
async function saveUser() {
    const token = localStorage.getItem('token');
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    const rolId = document.getElementById('rol').value;
    const direccion = document.getElementById('direccion').value;
    const estado = document.getElementById('estado').value === 'true';

    // Validaciones
    if (!nombre || !correo || !rolId) {
        showNotification('error', 'Por favor complete todos los campos obligatorios');
        return;
    }

    if (!currentEditingId && !contrasena) {
        showNotification('error', 'La contraseña es obligatoria para nuevos usuarios');
        return;
    }

    const userData = {
        nombre: nombre,
        correo: correo,
        rol: { idRol: parseInt(rolId) },
        direccion: direccion,
        estado: estado
    };

    // Si es un nuevo usuario o se proporciona contraseña, incluirla
    if (currentEditingId) {
        userData.idUsuario = currentEditingId;
        // Solo incluir contraseña si se proporcionó
        if (contrasena) {
            userData.contrasena = contrasena;
        }
    } else {
        userData.contrasena = contrasena;
    }

    try {
        let response;
        
        if (currentEditingId) {
            // Actualizar usuario existente
            response = await fetch(`${API_BASE_URL}/usuario/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Crear nuevo usuario
            response = await fetch(`${API_BASE_URL}/usuario/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al guardar el usuario');
        }

        showNotification('success', `Usuario ${currentEditingId ? 'actualizado' : 'creado'} exitosamente`);
        closeModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification('error', `Error al guardar: ${error.message}`);
    }
}

// -----------------------------
// ✏️ EDITAR USUARIO
// -----------------------------
function editUser(user) {
    openModal(user);
}

// -----------------------------
// 🗑️ ELIMINAR USUARIO
// -----------------------------
async function deleteUser(userId) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/usuario/delete/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
        }

        showNotification('success', 'Usuario eliminado exitosamente');
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification('error', `Error al eliminar: ${error.message}`);
    }
}

// -----------------------------
// 📢 MOSTRAR NOTIFICACIONES
// -----------------------------
function showNotification(type, message) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// -----------------------------
// 🚀 INICIALIZACIÓN
// -----------------------------
document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await validateAdminSession();
    if (isAdmin) {
        loadUsers();
    }
});
