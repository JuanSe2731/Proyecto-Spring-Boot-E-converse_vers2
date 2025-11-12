package backend.application.service;

import java.util.List;
import backend.application.model.Carrito;

public interface ICarritoService {
	List<Carrito> getCarritos();
    Carrito nuevoCarrito(Carrito carrito);
    Carrito buscarCarrito(String id);
    int borrarCarrito(String id);
}
