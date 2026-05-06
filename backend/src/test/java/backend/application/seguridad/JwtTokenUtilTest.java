package backend.application.seguridad;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JwtTokenUtil - Pruebas Unitarias")
class JwtTokenUtilTest {

    private JwtTokenUtil jwtTokenUtil;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtTokenUtil = new JwtTokenUtil();
        userDetails = new User("testuser@example.com", "password", Collections.emptyList());
    }

    @Test
    @DisplayName("Debe generar un token JWT válido")
    void generateToken_debeGenerarTokenValido() {
        String token = jwtTokenUtil.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        // Un JWT tiene 3 partes separadas por puntos
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
    }

    @Test
    @DisplayName("Debe extraer username del token")
    void getUsernameFromToken_debeRetornarUsername() {
        String token = jwtTokenUtil.generateToken(userDetails);

        String username = jwtTokenUtil.getUsernameFromToken(token);

        assertEquals("testuser@example.com", username);
    }

    @Test
    @DisplayName("Debe validar token con usuario correcto")
    void validateToken_debeRetornarTrueConUsuarioCorrecto() {
        String token = jwtTokenUtil.generateToken(userDetails);

        boolean esValido = jwtTokenUtil.validateToken(token, userDetails);

        assertTrue(esValido);
    }

    @Test
    @DisplayName("Debe fallar validación con usuario incorrecto")
    void validateToken_debeRetornarFalseConUsuarioIncorrecto() {
        String token = jwtTokenUtil.generateToken(userDetails);
        UserDetails otroUsuario = new User("otro@example.com", "password", Collections.emptyList());

        boolean esValido = jwtTokenUtil.validateToken(token, otroUsuario);

        assertFalse(esValido);
    }

    @Test
    @DisplayName("Debe validar estructura del token")
    void validateToken_debeValidarEstructura() {
        String token = jwtTokenUtil.generateToken(userDetails);

        boolean esValido = jwtTokenUtil.validateToken(token);

        assertTrue(esValido);
    }

    @Test
    @DisplayName("Debe fallar con token inválido")
    void validateToken_debeRetornarFalseConTokenInvalido() {
        boolean esValido = jwtTokenUtil.validateToken("token.invalido.aqui");

        assertFalse(esValido);
    }

    @Test
    @DisplayName("Debe retornar null con token malformado")
    void getUsernameFromToken_debeRetornarNullConTokenMalformado() {
        String username = jwtTokenUtil.getUsernameFromToken("not-a-valid-token");

        assertNull(username);
    }

    @Test
    @DisplayName("Debe generar tokens diferentes para diferentes usuarios")
    void generateToken_debeGenerarTokensDiferentes() {
        UserDetails otroUsuario = new User("otro@example.com", "password", Collections.emptyList());

        String token1 = jwtTokenUtil.generateToken(userDetails);
        String token2 = jwtTokenUtil.generateToken(otroUsuario);

        assertNotEquals(token1, token2);
    }
}
