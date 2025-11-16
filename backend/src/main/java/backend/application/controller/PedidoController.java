package backend.application.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.application.model.Pedido;
import backend.application.model.Usuario;
import backend.application.repository.UsuarioRepository;
import backend.application.seguridad.JwtTokenUtil;
import backend.application.service.PedidoService;

@RestController
@RequestMapping("/pedido")
public class PedidoController {
	
	@Autowired
	PedidoService pedidoService;
	
	@Autowired
	private JwtTokenUtil jwtTokenUtil;
	
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@GetMapping("/list")
	public List<Pedido> listarPedidos() {
		return pedidoService.getPedidos();
	}
	
	@GetMapping("/list/{id}")
	public Pedido buscarId(@PathVariable String id) {
		return pedidoService.buscarPedido(id);
	}
	
	@GetMapping("/mis-pedidos")
	public ResponseEntity<?> obtenerMisPedidos(@RequestHeader("Authorization") String authHeader) {
		try {
			// Validar token y obtener usuario
			if (authHeader == null || !authHeader.startsWith("Bearer ")) {
				return ResponseEntity.status(401).body("Usuario no autorizado");
			}
			
			String token = authHeader.substring(7);
			String username = jwtTokenUtil.getUsernameFromToken(token);
			
			if (username == null) {
				return ResponseEntity.status(401).body("Token inválido");
			}
			
			Usuario usuario = usuarioRepository.findByCorreo(username).orElse(null);
			if (usuario == null) {
				return ResponseEntity.status(401).body("Usuario no encontrado");
			}
			
			// Obtener todos los pedidos y filtrar por usuario
			List<Pedido> todosPedidos = pedidoService.getPedidos();
			List<Pedido> pedidosUsuario = todosPedidos.stream()
				.filter(p -> p.getUsuario() != null && 
					usuario.getIdUsuario().equals(p.getUsuario().getIdUsuario()))
				.collect(Collectors.toList());
			
			return ResponseEntity.ok(pedidosUsuario);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("Error al obtener pedidos: " + e.getMessage());
		}
	}
	
	@PostMapping("/new")
	public ResponseEntity<Pedido> agregar(@RequestBody Pedido pedido) {
		try {
			// Si la fecha viene como null, establecer la fecha actual
			if (pedido.getFechaPedido() == null) {
				pedido.setFechaPedido(LocalDateTime.now());
			}
			
			// Si el total viene como null, calcularlo desde los productos
			if (pedido.getTotal() == null && pedido.getProductos() != null) {
				BigDecimal total = pedido.getProductos().stream()
					.map(item -> item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO)
					.reduce(BigDecimal.ZERO, BigDecimal::add);
				pedido.setTotal(total);
			}
			
			Pedido obj = pedidoService.nuevoPedido(pedido);
			return new ResponseEntity<>(obj, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PutMapping("/update")
	public ResponseEntity<Pedido> editar(@RequestBody Pedido pedido) {
		Pedido obj = pedidoService.buscarPedido(pedido.getIdPedido());
		if (obj != null) {
			obj.setEstado(pedido.getEstado());
			obj.setFechaPedido(pedido.getFechaPedido());
			obj.setTotal(pedido.getTotal());
			obj.setUsuario(pedido.getUsuario());
			pedidoService.nuevoPedido(obj);
			return new ResponseEntity<>(obj, HttpStatus.OK);
		}
		return new ResponseEntity<>(obj, HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Pedido> eliminar(@PathVariable String id) {
		Pedido obj = pedidoService.buscarPedido(id);
		if (obj != null) {
			pedidoService.borrarPedido(id);
			return new ResponseEntity<>(obj, HttpStatus.OK);
		}
		return new ResponseEntity<>(obj, HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
}
