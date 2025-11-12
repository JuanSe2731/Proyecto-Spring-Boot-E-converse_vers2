package backend.application.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.application.model.Rol;

public interface RolRepository extends MongoRepository<Rol, String>{

}
