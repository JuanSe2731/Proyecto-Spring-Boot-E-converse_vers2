package backend.application.service;

import backend.application.model.Rol;
import backend.application.model.Usuario;
import backend.application.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioService - Pruebas Unitarias")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario1;
    private Usuario usuario2;
    private Rol rolAdmin;
    private Rol rolCliente;

    @BeforeEach
    void setUp() {
        rolAdmin = new Rol("1", "Administrador");
        rolCliente = new Rol("2", "Cliente");

        usuario1 = new Usuario();
        usuario1.setIdUsuario("usr1");
        usuario1.setNombre("Juan Pérez");
        usuario1.setCorreo("juan@example.com");
        usuario1.setContrasena("password123");
        usuario1.setDireccion("Calle 123");
        usuario1.setEstado(true);
        usuario1.setRol(rolAdmin);

        usuario2 = new Usuario();
        usuario2.setIdUsuario("usr2");
        usuario2.setNombre("María García");
        usuario2.setCorreo("maria@example.com");
        usuario2.setContrasena("password456");
        usuario2.setDireccion("Carrera 45");
        usuario2.setEstado(true);
        usuario2.setRol(rolCliente);
    }

    @Test
    @DisplayName("Debe listar todos los usuarios")
    void getUsuarios_debeRetornarListaDeUsuarios() {
        when(usuarioRepository.findAll()).thenReturn(Arrays.asList(usuario1, usuario2));

        List<Usuario> resultado = usuarioService.getUsuarios();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("Juan Pérez", resultado.get(0).getNombre());
        assertEquals("María García", resultado.get(1).getNombre());
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe crear nuevo usuario con contraseña encriptada")
    void nuevoUsuario_debeEncriptarContrasena() {
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedpassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            assertEquals("$2a$10$hashedpassword", u.getContrasena());
            return u;
        });

        Usuario resultado = usuarioService.nuevoUsuario(usuario1);

        assertNotNull(resultado);
        verify(passwordEncoder, times(1)).encode("password123");
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe buscar usuario por ID existente")
    void buscarUsuario_debeRetornarUsuario() {
        when(usuarioRepository.findAll()).thenReturn(Arrays.asList(usuario1, usuario2));
        when(usuarioRepository.findById("usr1")).thenReturn(Optional.of(usuario1));

        Usuario resultado = usuarioService.buscarUsuario("usr1");

        assertNotNull(resultado);
        assertEquals("usr1", resultado.getIdUsuario());
        assertEquals("Juan Pérez", resultado.getNombre());
    }

    @Test
    @DisplayName("Debe retornar null cuando usuario no existe")
    void buscarUsuario_debeRetornarNullSiNoExiste() {
        when(usuarioRepository.findAll()).thenReturn(List.of());
        when(usuarioRepository.findById("inexistente")).thenReturn(Optional.empty());

        Usuario resultado = usuarioService.buscarUsuario("inexistente");

        assertNull(resultado);
    }

    @Test
    @DisplayName("Debe eliminar usuario correctamente")
    void borrarUsuario_debeEliminarUsuario() {
        doNothing().when(usuarioRepository).deleteById("usr1");

        int resultado = usuarioService.borrarUsuario("usr1");

        assertEquals(1, resultado);
        verify(usuarioRepository, times(1)).deleteById("usr1");
    }

    @Test
    @DisplayName("Debe actualizar usuario sin re-encriptar contraseña")
    void actualizarUsuario_noDebeReencriptarContrasena() {
        usuario1.setNombre("Juan Pérez Actualizado");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario1);

        Usuario resultado = usuarioService.actualizarUsuario(usuario1);

        assertNotNull(resultado);
        assertEquals("Juan Pérez Actualizado", resultado.getNombre());
        verify(passwordEncoder, never()).encode(anyString());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe listar usuarios con roles correctos")
    void getUsuarios_debeRetornarUsuariosConRoles() {
        when(usuarioRepository.findAll()).thenReturn(Arrays.asList(usuario1, usuario2));

        List<Usuario> resultado = usuarioService.getUsuarios();

        assertEquals("Administrador", resultado.get(0).getRol().getNombre());
        assertEquals("Cliente", resultado.get(1).getRol().getNombre());
    }

    @Test
    @DisplayName("Debe retornar lista vacía si no hay usuarios")
    void getUsuarios_debeRetornarListaVacia() {
        when(usuarioRepository.findAll()).thenReturn(List.of());

        List<Usuario> resultado = usuarioService.getUsuarios();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }
}
