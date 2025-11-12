package backend.application.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.application.model.Categoria;

public interface CategoriaRepository extends MongoRepository<Categoria, String>{

}
