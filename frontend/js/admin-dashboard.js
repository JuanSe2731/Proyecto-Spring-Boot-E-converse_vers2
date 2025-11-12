const API_BASE_URL = 'http://localhost:8080';

// Validar sesión y rol de administrador
async function validateAdminSession() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/user-info`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return;
        }

        const userData = await response.json();
        
        // Guardar los datos del usuario en localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Verificar que sea administrador
        if (!userData.rol || userData.rol.nombre !== 'Administrador') {
            alert('No tienes permisos de administrador');
            window.location.href = '/views/client/dashboard.html';
            return;
        }

        // Mostrar nombre de usuario
        const usernameDisplay = document.getElementById('admin-username');
        if (usernameDisplay) {
            usernameDisplay.textContent = userData.username;
        }

        // Cargar estadísticas
        await loadStatistics();

    } catch (error) {
        console.error('Error validando sesión:', error);
        window.location.href = '/index.html';
    }
}

// Cargar estadísticas del dashboard
async function loadStatistics() {
    const token = localStorage.getItem('token');

    try {
        // Cargar contadores
        await Promise.all([
            loadCount('usuarios', '/usuario/list'),
            loadCount('productos', '/productos/list'),
            loadCount('categorias', '/categorias/list'),
            loadCount('pedidos', '/pedidos/list'),
            loadCount('roles', '/roles/list')
        ]);

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Cargar contador de un recurso
async function loadCount(resource, endpoint) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const countElement = document.getElementById(`${resource}-count`);
            if (countElement) {
                countElement.textContent = data.length || 0;
            }
        }
    } catch (error) {
        console.error(`Error cargando ${resource}:`, error);
    }
}

// Volver a la tienda
function volverTienda() {
    window.location.href = '/views/client/dashboard.html';
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/index.html';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    validateAdminSession();
});
