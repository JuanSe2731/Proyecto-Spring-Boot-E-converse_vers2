package backend.application.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import backend.application.model.Carrito;
import backend.application.repository.CarritoRepository;

import org.springframework.stereotype.Service;

@Service
public class CarritoService implements ICarritoService {
	
	@Autowired
    CarritoRepository carritoRepository;

    @Override
    public List<Carrito> getCarritos() {
        return carritoRepository.findAll();
    }

    @Override
    public Carrito nuevoCarrito(Carrito carrito) {
        return carritoRepository.save(carrito);
    }

    @Override
    public Carrito buscarCarrito(String id) {
        return carritoRepository.findById(id).orElse(null);
    }

    @Override
    public int borrarCarrito(String id) {
        carritoRepository.deleteById(id);
        return 1;
    }
	
}
