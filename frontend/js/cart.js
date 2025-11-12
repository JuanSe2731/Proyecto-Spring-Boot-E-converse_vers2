document.addEventListener('DOMContentLoaded', async () => {
    await validateSession();
    await loadCartItems();
});

async function validateSession() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/user-info', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error de autenticación');

        const userData = await response.json();
        document.getElementById('username-display').textContent = userData.username;

    } catch (error) {
        console.error('Error:', error);
        window.location.href = '../../index.html';
    }
}

async function loadCartItems() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:8080/api/carrito', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar el carrito');

        const cart = await response.json();
        displayCartItems(cart.items);
        updateSummary(cart);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el carrito');
    }
}

function displayCartItems(items) {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.producto.imagen}" alt="${item.producto.nombre}">
            <div class="item-details">
                <h3>${item.producto.nombre}</h3>
                <p class="price">$${item.producto.precio.toLocaleString()}</p>
            </div>
            <div class="item-quantity">
                <button onclick="updateQuantity(${item.id}, ${item.cantidad - 1})">-</button>
                <span>${item.cantidad}</span>
                <button onclick="updateQuantity(${item.id}, ${item.cantidad + 1})">+</button>
            </div>
            <div class="item-total">
                $${(item.producto.precio * item.cantidad).toLocaleString()}
            </div>
            <button onclick="removeFromCart(${item.id})" class="remove-button">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(itemElement);
    });
}

function updateSummary(cart) {
    const subtotal = cart.items.reduce((total, item) => 
        total + (item.producto.precio * item.cantidad), 0);
    const tax = subtotal * 0.19; // IVA 19%
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `$${tax.toLocaleString()}`;
    document.getElementById('total').textContent = `$${total.toLocaleString()}`;
}

async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:8080/api/carrito/actualizar/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cantidad: newQuantity })
        });

        if (!response.ok) throw new Error('Error al actualizar cantidad');

        loadCartItems();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la cantidad');
    }
}

async function removeFromCart(itemId) {
    if (!confirm('¿Está seguro de eliminar este producto del carrito?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:8080/api/carrito/eliminar/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al eliminar item');

        loadCartItems();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto del carrito');
    }
}

async function processPurchase() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:8080/api/pedidos/crear', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al procesar la compra');

        alert('¡Compra realizada con éxito!');
        window.location.href = '../client/orders.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '../../index.html';
}