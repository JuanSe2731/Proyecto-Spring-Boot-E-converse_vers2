package backend.application.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.application.model.Producto;
import backend.application.service.ProductoService;

@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500"}, allowCredentials = "true")
public class ProductoController {
	
	@Autowired
    ProductoService productoService;

    @GetMapping("/list")
    public ResponseEntity<?> listarProductos() {
        try {
            System.out.println("📋 Listando todos los productos");
            List<Producto> productos = productoService.getProductos();
            System.out.println("✅ Total productos: " + productos.size());
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            System.err.println("❌ Error al listar productos: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al listar productos");
        }
    }

    @GetMapping("/list/{id}")
    public ResponseEntity<?> buscarId(@PathVariable String id) {
        try {
            System.out.println("🔍 Buscando producto ID: " + id);
            Producto producto = productoService.buscarProducto(id);
            if (producto != null) {
                System.out.println("✅ Producto encontrado: " + producto.getNombre());
                return ResponseEntity.ok(producto);
            }
            System.err.println("❌ Producto no encontrado con ID: " + id);
            return ResponseEntity.status(404).body("Producto no encontrado");
        } catch (Exception e) {
            System.err.println("❌ Error al buscar producto: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al buscar producto");
        }
    }

    @PostMapping("/new")
    public ResponseEntity<?> agregar(@RequestBody Producto producto) {
        try {
            System.out.println("➕ Creando nuevo producto: " + producto.getNombre());
            System.out.println("📦 Categoría ID: " + (producto.getCategoria() != null ? producto.getCategoria().getIdCategoria() : "null"));
            
            Producto obj = productoService.nuevoProducto(producto);
            System.out.println("✅ Producto creado con ID: " + obj.getIdProducto());
            return ResponseEntity.ok(obj);
        } catch (Exception e) {
            System.err.println("❌ Error al crear producto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al crear producto: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> editar(@RequestBody Producto producto) {
        try {
            System.out.println("🔄 Actualizando producto ID: " + producto.getIdProducto());
            Producto obj = productoService.buscarProducto(producto.getIdProducto());
            
            if (obj != null) {
                obj.setNombre(producto.getNombre());
                obj.setDescripcion(producto.getDescripcion());
                obj.setPrecio(producto.getPrecio());
                obj.setStock(producto.getStock());
                obj.setImagenUrl(producto.getImagenUrl());
                obj.setCategoria(producto.getCategoria());
                
                productoService.nuevoProducto(obj);
                System.out.println("✅ Producto actualizado: " + obj.getNombre());
                return ResponseEntity.ok(obj);
            }
            
            System.err.println("❌ Producto no encontrado con ID: " + producto.getIdProducto());
            return ResponseEntity.status(404).body("Producto no encontrado");
        } catch (Exception e) {
            System.err.println("❌ Error al actualizar producto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al actualizar producto: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            System.out.println("🗑️ Intentando eliminar producto ID: " + id);
            Producto obj = productoService.buscarProducto(id);
            
            if (obj != null) {
                productoService.borrarProducto(id);
                System.out.println("✅ Producto eliminado exitosamente");
                return ResponseEntity.ok(obj);
            }
            
            System.err.println("❌ Producto no encontrado con ID: " + id);
            return ResponseEntity.status(404).body("Producto no encontrado");
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar producto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al eliminar producto: " + e.getMessage());
        }
    }
	
}
