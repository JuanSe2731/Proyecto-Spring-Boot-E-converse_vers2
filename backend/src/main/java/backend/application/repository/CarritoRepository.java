package backend.application.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.application.model.Carrito;
import backend.application.model.Usuario;

public interface CarritoRepository extends MongoRepository<Carrito, String> {
	Optional<Carrito> findByUsuario(Usuario usuario);

}
