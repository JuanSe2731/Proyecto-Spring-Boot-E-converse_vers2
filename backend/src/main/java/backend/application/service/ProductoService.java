package backend.application.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import backend.application.model.Producto;
import backend.application.repository.ProductoRepository;

import org.springframework.stereotype.Service;

@Service
public class ProductoService implements IProductoService {
	
	@Autowired
    ProductoRepository productoRepository;

    @Override
    public List<Producto> getProductos() {
        return productoRepository.findAll();
    }

    @Override
    public Producto nuevoProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    public Producto buscarProducto(String id) {
        return productoRepository.findById(id).orElse(null);
    }

    @Override
    public int borrarProducto(String id) {
        productoRepository.deleteById(id);
        return 1;
    }
	
}
