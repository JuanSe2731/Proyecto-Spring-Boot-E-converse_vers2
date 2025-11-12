package backend.application.service;

import java.util.List;
import backend.application.model.Categoria;

public interface ICategoriaService {
	
	List<Categoria> getCategorias();
    Categoria nuevaCategoria(Categoria categoria);
    Categoria buscarCategoria(String id);
    int borrarCategoria(String id);
	
}
