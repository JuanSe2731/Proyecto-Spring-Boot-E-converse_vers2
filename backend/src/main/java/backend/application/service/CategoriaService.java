package backend.application.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import backend.application.model.Categoria;
import backend.application.repository.CategoriaRepository;

import org.springframework.stereotype.Service;

@Service
public class CategoriaService implements ICategoriaService {
	
	@Autowired
    CategoriaRepository categoriaRepository;

    @Override
    public List<Categoria> getCategorias() {
        return categoriaRepository.findAll();
    }

    @Override
    public Categoria nuevaCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    public Categoria buscarCategoria(String id) {
        return categoriaRepository.findById(id).orElse(null);
    }

    @Override
    public int borrarCategoria(String id) {
        categoriaRepository.deleteById(id);
        return 1;
    }
	
}
