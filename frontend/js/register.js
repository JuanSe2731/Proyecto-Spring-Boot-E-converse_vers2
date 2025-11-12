async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.querySelector('button[type="submit"]');

    // Validaciones
    if (!username || username.length > 100) {
        errorMessage.textContent = 'El nombre de usuario es requerido y debe tener menos de 100 caracteres';
        errorMessage.classList.add('show');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Correo electrónico inválido';
        errorMessage.classList.add('show');
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorMessage.classList.add('show');
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Las contraseñas no coinciden';
        errorMessage.classList.add('show');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';

    try {
        const response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito
            errorMessage.textContent = '¡Registro exitoso! Redirigiendo...';
            errorMessage.style.color = '#4CAF50';
            errorMessage.classList.add('show');
            
            // Esperar 2 segundos antes de redirigir
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            errorMessage.style.color = '#f44336';
            if (response.status === 400) {
                if (data.message?.toLowerCase().includes('correo') || data.message?.toLowerCase().includes('email')) {
                    errorMessage.textContent = 'El correo electrónico ya está registrado';
                } else if (data.message?.toLowerCase().includes('usuario') || data.message?.toLowerCase().includes('username')) {
                    errorMessage.textContent = 'El nombre de usuario ya está registrado';
                } else {
                    errorMessage.textContent = data.message || 'Error en el registro. Por favor, verifica los datos.';
                }
            } else {
                errorMessage.textContent = data.message || 'Error en el servidor. Por favor, intenta más tarde.';
            }
            errorMessage.classList.add('show');
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Error de conexión con el servidor';
        errorMessage.style.color = '#f44336';
        errorMessage.classList.add('show');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Registrarse';
    }
}

document.getElementById('username').addEventListener('input', removeErrorMessage);
document.getElementById('email').addEventListener('input', removeErrorMessage);
document.getElementById('password').addEventListener('input', removeErrorMessage);
document.getElementById('confirmPassword').addEventListener('input', removeErrorMessage);

function removeErrorMessage() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.remove('show');
}