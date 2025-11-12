package backend.application.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.application.model.Producto;

public interface ProductoRepository extends MongoRepository<Producto, String>{

}
