package backend.application.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.application.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String>{
	
	Optional<Usuario> findByCorreo(String correo);

}
