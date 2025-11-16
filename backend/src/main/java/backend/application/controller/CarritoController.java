package backend.application.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.application.model.Carrito;
import backend.application.model.ItemCarrito;
import backend.application.model.Producto;
import backend.application.model.Usuario;
import backend.application.repository.CarritoRepository;
import backend.application.repository.ProductoRepository;
import backend.application.repository.UsuarioRepository;
import backend.application.seguridad.JwtTokenUtil;

@RestController
@RequestMapping("/carrito")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class CarritoController {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // DTO para recibir solicitudes
    public static class AddToCartRequest {
        public String productoId;
        public Integer cantidad;

        public String getProductoId() { return productoId; }
        public Integer getCantidad() { return cantidad; }
    }

    // ✅ 1. Obtener carrito actual del usuario
    @GetMapping
    public ResponseEntity<?> obtenerCarrito(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuario = validarToken(authHeader);
            if (usuario == null)
                return ResponseEntity.status(401).body(Map.of("message", "Usuario no autorizado"));

            Carrito carrito = carritoRepository.findByIdUsuario(usuario.getIdUsuario()).orElse(null);
            if (carrito == null)
                return ResponseEntity.ok(Map.of("items", new ArrayList<>(), "total", 0));

            BigDecimal total = carrito.getTotal();
            return ResponseEntity.ok(Map.of("items", carrito.getProductos(), "total", total));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al obtener carrito", "error", e.getMessage()));
        }
    }

    // ✅ Obtener items del carrito (endpoint alternativo para frontend)
    @GetMapping("/mis-items")
    public ResponseEntity<?> obtenerMisItems(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuario = validarToken(authHeader);
            if (usuario == null)
                return ResponseEntity.status(401).body(Map.of("message", "Usuario no autorizado"));

            Carrito carrito = carritoRepository.findByIdUsuario(usuario.getIdUsuario()).orElse(null);
            if (carrito == null || carrito.getProductos() == null)
                return ResponseEntity.ok(new ArrayList<>());

            // Convertir ItemCarrito a formato que el frontend espera
            List<Map<String, Object>> items = carrito.getProductos().stream()
                .map(item -> {
                    // Buscar el producto completo para tener toda la información
                    Producto producto = productoRepository.findById(item.getIdProducto()).orElse(null);
                    
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("idItemCarrito", item.getIdProducto()); // Usar idProducto como ID del item
                    itemMap.put("cantidad", item.getCantidad());
                    
                    // Información del producto
                    Map<String, Object> productoMap = new HashMap<>();
                    if (producto != null) {
                        productoMap.put("idProducto", producto.getIdProducto());
                        productoMap.put("nombre", producto.getNombre());
                        productoMap.put("descripcion", producto.getDescripcion());
                        productoMap.put("precio", producto.getPrecio());
                        productoMap.put("stock", producto.getStock());
                        productoMap.put("imagenUrl", producto.getImagenUrl());
                        productoMap.put("categoria", producto.getCategoria());
                    } else {
                        // Si no se encuentra el producto, usar la info del ItemCarrito
                        productoMap.put("idProducto", item.getIdProducto());
                        productoMap.put("nombre", item.getNombreProducto());
                        productoMap.put("precio", item.getPrecioUnitario());
                    }
                    
                    itemMap.put("producto", productoMap);
                    return itemMap;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(items);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al obtener items", "error", e.getMessage()));
        }
    }

    // ✅ 2. Agregar producto al carrito
    @PostMapping("/agregar")
    public ResponseEntity<?> agregarAlCarrito(@RequestHeader("Authorization") String authHeader,
                                              @RequestBody AddToCartRequest req) {
        try {
            Usuario usuario = validarToken(authHeader);
            if (usuario == null)
                return ResponseEntity.status(401).body(Map.of("message", "Usuario no autorizado"));

            // Buscar carrito por ID de usuario (garantiza unicidad)
            Carrito carrito = carritoRepository.findByIdUsuario(usuario.getIdUsuario()).orElse(null);
            if (carrito == null) {
                carrito = new Carrito();
                carrito.setUsuario(usuario);
                carrito.setIdUsuario(usuario.getIdUsuario());
                carrito.setFechaCreacion(LocalDateTime.now());
                carrito.setProductos(new ArrayList<>());
            }

            Producto producto = productoRepository.findById(req.getProductoId()).orElse(null);
            if (producto == null)
                return ResponseEntity.status(404).body(Map.of("message", "Producto no encontrado"));

            // Verificar si ya existe el producto en el carrito
            ItemCarrito existente = carrito.getProductos().stream()
                    .filter(p -> p.getIdProducto().equals(req.getProductoId()))
                    .findFirst().orElse(null);

            if (existente != null) {
                existente.setCantidad(existente.getCantidad() + req.getCantidad());
                existente.setSubtotal(existente.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(existente.getCantidad())));
            } else {
                int cantidad = req.getCantidad() != null ? req.getCantidad() : 1;
                BigDecimal precioUnitario = producto.getPrecio() != null ? producto.getPrecio() : BigDecimal.ZERO;
                BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
                
                ItemCarrito nuevo = new ItemCarrito(
                        producto.getIdProducto(),
                        producto.getNombre(),
                        precioUnitario,
                        cantidad,
                        subtotal
                );
                carrito.getProductos().add(nuevo);
            }

            carritoRepository.save(carrito);
            return ResponseEntity.ok(Map.of("message", "Producto agregado al carrito", "carrito", carrito));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al agregar producto", "error", e.getMessage()));
        }
    }

    // ✅ 3. Actualizar cantidad de un producto
    @PutMapping("/actualizar/{productoId}")
    public ResponseEntity<?> actualizarCantidad(@RequestHeader("Authorization") String authHeader,
                                                @PathVariable String productoId,
                                                @RequestBody Map<String, Integer> body) {
        try {
            Usuario usuario = validarToken(authHeader);
            if (usuario == null)
                return ResponseEntity.status(401).body(Map.of("message", "Usuario no autorizado"));

            Carrito carrito = carritoRepository.findByIdUsuario(usuario.getIdUsuario()).orElse(null);
            if (carrito == null)
                return ResponseEntity.status(404).body(Map.of("message", "Carrito no encontrado"));

            Integer nuevaCantidad = body.get("cantidad");
            if (nuevaCantidad == null || nuevaCantidad < 1)
                return ResponseEntity.badRequest().body(Map.of("message", "Cantidad inválida"));

            List<ItemCarrito> actualizados = carrito.getProductos().stream()
                    .map(item -> {
                        if (item.getIdProducto().equals(productoId)) {
                            item.setCantidad(nuevaCantidad);
                            item.setSubtotal(item.getPrecioUnitario().multiply(BigDecimal.valueOf(nuevaCantidad)));
                        }
                        return item;
                    }).collect(Collectors.toList());

            carrito.setProductos(actualizados);
            carritoRepository.save(carrito);

            return ResponseEntity.ok(Map.of("message", "Cantidad actualizada", "carrito", carrito));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al actualizar producto", "error", e.getMessage()));
        }
    }

    // ✅ 4. Eliminar producto del carrito
    @DeleteMapping("/eliminar/{productoId}")
    public ResponseEntity<?> eliminarProducto(@RequestHeader("Authorization") String authHeader,
                                              @PathVariable String productoId) {
        try {
            Usuario usuario = validarToken(authHeader);
            if (usuario == null)
                return ResponseEntity.status(401).body(Map.of("message", "Usuario no autorizado"));

            Carrito carrito = carritoRepository.findByIdUsuario(usuario.getIdUsuario()).orElse(null);
            if (carrito == null)
                return ResponseEntity.status(404).body(Map.of("message", "Carrito no encontrado"));

            boolean eliminado = carrito.getProductos().removeIf(item -> item.getIdProducto().equals(productoId));

            if (!eliminado)
                return ResponseEntity.status(404).body(Map.of("message", "Producto no encontrado en carrito"));

            carritoRepository.save(carrito);
            return ResponseEntity.ok(Map.of("message", "Producto eliminado del carrito", "carrito", carrito));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al eliminar producto", "error", e.getMessage()));
        }
    }

    // ✅ 5. Vaciar carrito completo (usado después de crear pedido)
    @DeleteMapping("/vaciar")
    public ResponseEntity<?> vaciarCarrito(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuario = validarToken(authHeader);
            if (usuario == null)
                return ResponseEntity.status(401).body(Map.of("message", "Usuario no autorizado"));

            Carrito carrito = carritoRepository.findByIdUsuario(usuario.getIdUsuario()).orElse(null);
            if (carrito != null) {
                carritoRepository.delete(carrito);
            }

            return ResponseEntity.ok(Map.of("message", "Carrito vaciado correctamente"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al vaciar carrito", "error", e.getMessage()));
        }
    }

    // 🔐 Función auxiliar para validar token y devolver el usuario
    private Usuario validarToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String username = jwtTokenUtil.getUsernameFromToken(token);
        if (username == null) return null;
        return usuarioRepository.findByCorreo(username).orElse(null);
    }
}
