package backend.application.controller;

import backend.application.model.Rol;
import backend.application.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/roles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500"}, allowCredentials = "true")
public class RolController {

    @Autowired
    private RolRepository rolRepository;

    // Listar todos los roles
    @GetMapping("/list")
    public List<Rol> listarRoles() {
        return rolRepository.findAll();
    }

    // Obtener un rol por ID
    @GetMapping("/list/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable String id) {
        Optional<Rol> rol = rolRepository.findById(id);
        return rol.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // Crear un nuevo rol
    @PostMapping("/new")
    public ResponseEntity<?> crearRol(@RequestBody Rol rol) {
        try {
            System.out.println("➕ Creando nuevo rol: " + rol.getNombre());
            Rol nuevoRol = rolRepository.save(rol);
            System.out.println("✅ Rol creado con ID: " + nuevoRol.getIdRol());
            return ResponseEntity.ok(nuevoRol);
        } catch (Exception e) {
            System.err.println("❌ Error al crear rol: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al crear rol: " + e.getMessage());
        }
    }

    // Actualizar un rol existente
    @PutMapping("/update")
    public ResponseEntity<?> actualizarRol(@RequestBody Rol rol) {
        try {
            System.out.println("🔄 Actualizando rol ID: " + rol.getIdRol());
            
            if (rol.getIdRol() == null || !rolRepository.existsById(rol.getIdRol())) {
                System.err.println("❌ Rol no encontrado con ID: " + rol.getIdRol());
                return ResponseEntity.status(404).body("Rol no encontrado");
            }
            
            Rol rolActualizado = rolRepository.save(rol);
            System.out.println("✅ Rol actualizado: " + rolActualizado.getNombre());
            return ResponseEntity.ok(rolActualizado);
        } catch (Exception e) {
            System.err.println("❌ Error al actualizar rol: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al actualizar rol: " + e.getMessage());
        }
    }

    // Eliminar un rol
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminarRol(@PathVariable String id) {
        try {
            System.out.println("🗑️ Intentando eliminar rol ID: " + id);
            
            if (!rolRepository.existsById(id)) {
                System.err.println("❌ Rol no encontrado con ID: " + id);
                return ResponseEntity.status(404).body("Rol no encontrado");
            }
            
            rolRepository.deleteById(id);
            System.out.println("✅ Rol eliminado exitosamente");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar rol: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al eliminar rol: " + e.getMessage());
        }
    }
}
