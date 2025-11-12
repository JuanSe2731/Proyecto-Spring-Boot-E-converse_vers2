package backend.application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import backend.application.model.Rol;
import backend.application.model.Usuario;
import backend.application.repository.RolRepository;
import backend.application.repository.UsuarioRepository;
import backend.application.seguridad.CustomUserDetailsService;
import backend.application.seguridad.JwtTokenUtil;
import backend.application.service.UsuarioService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500"}, allowCredentials = "true")
public class AuthController {
	
	@Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolRepository rolRepository;

    /**
     * Endpoint para obtener información del usuario autenticado.
     * Requiere token JWT válido.
     */
    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extraer el token del header (eliminar "Bearer ")
            String token = authHeader.substring(7);
            
            // Validar el token y obtener el username
            String username = jwtTokenUtil.getUsernameFromToken(token);
            if (username == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Token inválido"));
            }

            // Cargar los detalles del usuario
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // Validar si el token es válido para este usuario
            if (!jwtTokenUtil.validateToken(token, userDetails)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Token inválido"));
            }

            // Obtener el usuario completo de la base de datos para acceder al rol
            Usuario usuario = usuarioRepository.findByCorreo(username).orElse(null);
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Usuario no encontrado"));
            }

            // Crear respuesta con información del usuario incluyendo el rol completo
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", userDetails.getUsername());
            userInfo.put("isEnabled", userDetails.isEnabled());
            
            // Incluir el objeto Rol completo
            if (usuario.getRol() != null) {
                Map<String, Object> rolInfo = new HashMap<>();
                rolInfo.put("idRol", usuario.getRol().getIdRol());
                rolInfo.put("nombre", usuario.getRol().getNombre());
                userInfo.put("rol", rolInfo);
            }

            return ResponseEntity.ok(userInfo);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al obtener información del usuario"));
        }
    }

    /**
     * Endpoint para registro de nuevos usuarios.
     * Crea un nuevo usuario con rol de Cliente por defecto.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");

            // Validaciones básicas
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El nombre de usuario es requerido"));
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico es requerido"));
            }
            if (password == null || password.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "La contraseña debe tener al menos 6 caracteres"));
            }

            // Verificar si el correo ya existe
            if (usuarioRepository.findByCorreo(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico ya está registrado"));
            }

            // Obtener el rol de Cliente (id_rol = 2 según la imagen que proporcionaste)
            Rol rolCliente = rolRepository.findById("2").orElse(null);
            if (rolCliente == null) {
                return ResponseEntity.status(500).body(Map.of("message", "Error: Rol de Cliente no encontrado en la base de datos"));
            }

            // Crear el nuevo usuario
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(username);
            nuevoUsuario.setCorreo(email);
            nuevoUsuario.setContrasena(password); // El servicio la encriptará
            nuevoUsuario.setRol(rolCliente);
            nuevoUsuario.setDireccion(""); // Dirección vacía por defecto
            nuevoUsuario.setEstado(true); // Usuario activo por defecto

            // Guardar el usuario (la contraseña se encripta en el servicio)
            Usuario usuarioGuardado = usuarioService.nuevoUsuario(nuevoUsuario);

            // Respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Usuario registrado exitosamente");
            response.put("usuario", usuarioGuardado.getCorreo());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error en el servidor al registrar usuario", "error", e.getMessage()));
        }
    }

    /**
     * Endpoint para autenticación de usuarios.
     * Valida credenciales y genera un token JWT si son correctas.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Autenticación de usuario
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Carga del usuario desde base de datos
            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());

            // Generación del JWT
            String token = jwtTokenUtil.generateToken(userDetails);

            // Respuesta de autenticación exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("usuario", userDetails.getUsername());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Credenciales inválidas o error de autenticación
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            return ResponseEntity.status(401).body(error);
        }
    }

    /**
     * DTO interno para la solicitud de login
     */
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }
        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }
        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterRequest {
    private String nombre;
    private String nombreUsuario;
    private String correo;
    private String contrasena;
    private String direccion;

    // Getters y setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}

}
