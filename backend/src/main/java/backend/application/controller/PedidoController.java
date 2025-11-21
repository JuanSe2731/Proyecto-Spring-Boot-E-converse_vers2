package backend.application.controller;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
	
	@GetMapping("/estadisticas")
	public ResponseEntity<?> obtenerEstadisticas(
			@RequestParam(required = false, defaultValue = "semana") String periodo) {
		try {
			List<Pedido> todosPedidos = pedidoService.getPedidos();
			LocalDateTime ahora = LocalDateTime.now();
			LocalDateTime fechaInicio;
			
			// Determinar el rango de fechas según el período
			switch (periodo.toLowerCase()) {
				case "semana":
					// Inicio de la semana actual (lunes)
					fechaInicio = ahora.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
							.withHour(0).withMinute(0).withSecond(0).withNano(0);
					break;
				case "mes":
					// Inicio del mes actual
					fechaInicio = ahora.with(TemporalAdjusters.firstDayOfMonth())
							.withHour(0).withMinute(0).withSecond(0).withNano(0);
					break;
				case "anio":
				case "año":
					// Inicio del año actual
					fechaInicio = ahora.with(TemporalAdjusters.firstDayOfYear())
							.withHour(0).withMinute(0).withSecond(0).withNano(0);
					break;
				default:
					return ResponseEntity.badRequest().body("Período inválido. Use: semana, mes o año");
			}
			
			// Filtrar pedidos por el período
			List<Pedido> pedidosFiltrados = todosPedidos.stream()
				.filter(p -> p.getFechaPedido() != null && 
					!p.getFechaPedido().isBefore(fechaInicio) &&
					!p.getFechaPedido().isAfter(ahora))
				.collect(Collectors.toList());
			
			// Agrupar por día
			Map<String, Map<String, Object>> pedidosPorDia = new HashMap<>();
			for (Pedido pedido : pedidosFiltrados) {
				String dia = pedido.getFechaPedido().toLocalDate().toString();
				
				if (!pedidosPorDia.containsKey(dia)) {
					Map<String, Object> datos = new HashMap<>();
					datos.put("fecha", dia);
					datos.put("total", 0);
					datos.put("cantidad", 0);
					datos.put("pendientes", 0);
					datos.put("completados", 0);
					datos.put("cancelados", 0);
					pedidosPorDia.put(dia, datos);
				}
				
				Map<String, Object> datos = pedidosPorDia.get(dia);
				datos.put("cantidad", (int) datos.get("cantidad") + 1);
				
				BigDecimal totalActual = pedido.getTotal() != null ? pedido.getTotal() : BigDecimal.ZERO;
				datos.put("total", (int) datos.get("total") + totalActual.intValue());
				
				// Contar por estado
				if (pedido.getEstado() != null) {
					String estadoKey = pedido.getEstado().toLowerCase() + "s";
					if (datos.containsKey(estadoKey)) {
						datos.put(estadoKey, (int) datos.get(estadoKey) + 1);
					}
				}
			}
			
			// Convertir a lista y ordenar por fecha
			List<Map<String, Object>> resultado = new ArrayList<>(pedidosPorDia.values());
			resultado.sort((a, b) -> ((String) a.get("fecha")).compareTo((String) b.get("fecha")));
			
			// Estadísticas generales del período
			int totalPedidos = pedidosFiltrados.size();
			BigDecimal totalVentas = pedidosFiltrados.stream()
				.map(p -> p.getTotal() != null ? p.getTotal() : BigDecimal.ZERO)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
			
			int pendientes = (int) pedidosFiltrados.stream()
				.filter(p -> "Pendiente".equals(p.getEstado())).count();
			int completados = (int) pedidosFiltrados.stream()
				.filter(p -> "Completado".equals(p.getEstado())).count();
			int cancelados = (int) pedidosFiltrados.stream()
				.filter(p -> "Cancelado".equals(p.getEstado())).count();
			
			// Respuesta
			Map<String, Object> respuesta = new HashMap<>();
			respuesta.put("periodo", periodo);
			respuesta.put("fechaInicio", fechaInicio.toString());
			respuesta.put("fechaFin", ahora.toString());
			respuesta.put("totalPedidos", totalPedidos);
			respuesta.put("totalVentas", totalVentas.intValue());
			respuesta.put("pendientes", pendientes);
			respuesta.put("completados", completados);
			respuesta.put("cancelados", cancelados);
			respuesta.put("pedidosPorDia", resultado);
			
			return ResponseEntity.ok(respuesta);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("Error al obtener estadísticas: " + e.getMessage());
		}
	}
	
}
