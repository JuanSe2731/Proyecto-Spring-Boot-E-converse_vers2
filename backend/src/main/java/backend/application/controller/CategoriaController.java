package backend.application.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.application.model.Categoria;
import backend.application.service.CategoriaService;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500"}, allowCredentials = "true")
public class CategoriaController {
	
	@Autowired
    CategoriaService categoriaService;

    @GetMapping("/list")
    public ResponseEntity<?> listarCategorias() {
        try {
            System.out.println("📋 Listando todas las categorías");
            List<Categoria> categorias = categoriaService.getCategorias();
            System.out.println("✅ Total categorías: " + categorias.size());
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            System.err.println("❌ Error al listar categorías: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al listar categorías");
        }
    }

    @GetMapping("/list/{id}")
    public ResponseEntity<?> buscarId(@PathVariable String id) {
        try {
            System.out.println("🔍 Buscando categoría ID: " + id);
            Categoria categoria = categoriaService.buscarCategoria(id);
            if (categoria != null) {
                System.out.println("✅ Categoría encontrada: " + categoria.getNombre());
                return ResponseEntity.ok(categoria);
            }
            System.err.println("❌ Categoría no encontrada con ID: " + id);
            return ResponseEntity.status(404).body("Categoría no encontrada");
        } catch (Exception e) {
            System.err.println("❌ Error al buscar categoría: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al buscar categoría");
        }
    }

    @PostMapping("/new")
    public ResponseEntity<?> agregar(@RequestBody Categoria categoria) {
        try {
            System.out.println("➕ Creando nueva categoría: " + categoria.getNombre());
            Categoria obj = categoriaService.nuevaCategoria(categoria);
            System.out.println("✅ Categoría creada con ID: " + obj.getIdCategoria());
            return ResponseEntity.ok(obj);
        } catch (Exception e) {
            System.err.println("❌ Error al crear categoría: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al crear categoría: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> editar(@RequestBody Categoria categoria) {
        try {
            System.out.println("🔄 Actualizando categoría ID: " + categoria.getIdCategoria());
            Categoria obj = categoriaService.buscarCategoria(categoria.getIdCategoria());
            
            if (obj != null) {
                obj.setNombre(categoria.getNombre());
                obj.setDescripcion(categoria.getDescripcion());
                categoriaService.nuevaCategoria(obj);
                System.out.println("✅ Categoría actualizada: " + obj.getNombre());
                return ResponseEntity.ok(obj);
            }
            
            System.err.println("❌ Categoría no encontrada con ID: " + categoria.getIdCategoria());
            return ResponseEntity.status(404).body("Categoría no encontrada");
        } catch (Exception e) {
            System.err.println("❌ Error al actualizar categoría: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al actualizar categoría: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            System.out.println("🗑️ Intentando eliminar categoría ID: " + id);
            Categoria obj = categoriaService.buscarCategoria(id);
            
            if (obj != null) {
                categoriaService.borrarCategoria(id);
                System.out.println("✅ Categoría eliminada exitosamente");
                return ResponseEntity.ok(obj);
            }
            
            System.err.println("❌ Categoría no encontrada con ID: " + id);
            return ResponseEntity.status(404).body("Categoría no encontrada");
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar categoría: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al eliminar categoría: " + e.getMessage());
        }
    }
	
}
