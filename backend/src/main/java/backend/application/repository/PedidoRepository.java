package backend.application.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.application.model.Pedido;

public interface PedidoRepository extends MongoRepository<Pedido, String>{

}
