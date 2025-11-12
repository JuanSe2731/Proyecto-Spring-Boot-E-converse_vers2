package backend.application.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import backend.application.model.Pedido;
import backend.application.repository.PedidoRepository;

import org.springframework.stereotype.Service;

@Service
public class PedidoService implements IPedidoService {
	
	@Autowired
	PedidoRepository pedidoRepository;
	
	@Override
	public List<Pedido> getPedidos() {
		return pedidoRepository.findAll();
	}
	
	@Override
	public Pedido nuevoPedido(Pedido pedido) {
		return pedidoRepository.save(pedido);
	}
	
	@Override
	public Pedido buscarPedido(String id) {
		return pedidoRepository.findById(id).orElse(null);
	}
	
	@Override
	public int borrarPedido(String id) {
		pedidoRepository.deleteById(id);
		return 1;
	}
	
}
