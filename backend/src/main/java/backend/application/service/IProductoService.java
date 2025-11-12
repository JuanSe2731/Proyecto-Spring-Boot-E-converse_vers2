package backend.application.service;

import java.util.List;
import backend.application.model.Producto;

public interface IProductoService {
	
	List<Producto> getProductos();
    Producto nuevoProducto(Producto producto);
    Producto buscarProducto(String id);
    int borrarProducto(String id);
	
}
