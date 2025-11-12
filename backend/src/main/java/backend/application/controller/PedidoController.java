package backend.application.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.application.model.Pedido;
import backend.application.service.PedidoService;

@RestController
@RequestMapping("/pedido")
public class PedidoController {
	
	@Autowired
	PedidoService pedidoService;
	
	@GetMapping("/list")
	public List<Pedido> listarPedidos() {
		return pedidoService.getPedidos();
	}
	
	@GetMapping("/list/{id}")
	public Pedido buscarId(@PathVariable String id) {
		return pedidoService.buscarPedido(id);
	}
	
	@PostMapping("/new")
	public ResponseEntity<Pedido> agregar(@RequestBody Pedido pedido) {
		Pedido obj = pedidoService.nuevoPedido(pedido);
		return new ResponseEntity<>(obj, HttpStatus.OK);
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
