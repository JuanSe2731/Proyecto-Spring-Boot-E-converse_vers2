package backend.application.service;

import backend.application.model.Categoria;
import backend.application.repository.CategoriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoriaService - Pruebas Unitarias")
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaService categoriaService;

    private Categoria categoria1;
    private Categoria categoria2;
    private Categoria categoria3;

    @BeforeEach
    void setUp() {
        categoria1 = new Categoria();
        categoria1.setIdCategoria("cat1");
        categoria1.setNombre("Deportivos");
        categoria1.setDescripcion("Calzado para deportes");

        categoria2 = new Categoria();
        categoria2.setIdCategoria("cat2");
        categoria2.setNombre("Casuales");
        categoria2.setDescripcion("Calzado casual");

        categoria3 = new Categoria();
        categoria3.setIdCategoria("cat3");
        categoria3.setNombre("Formales");
        categoria3.setDescripcion("Calzado formal");
    }

    @Test
    @DisplayName("Debe listar todas las categorías")
    void getCategorias_debeRetornarListaDeCategorias() {
        when(categoriaRepository.findAll()).thenReturn(Arrays.asList(categoria1, categoria2, categoria3));

        List<Categoria> resultado = categoriaService.getCategorias();

        assertNotNull(resultado);
        assertEquals(3, resultado.size());
        assertEquals("Deportivos", resultado.get(0).getNombre());
        assertEquals("Casuales", resultado.get(1).getNombre());
        assertEquals("Formales", resultado.get(2).getNombre());
        verify(categoriaRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe retornar lista vacía cuando no hay categorías")
    void getCategorias_debeRetornarListaVacia() {
        when(categoriaRepository.findAll()).thenReturn(List.of());

        List<Categoria> resultado = categoriaService.getCategorias();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    @Test
    @DisplayName("Debe crear una nueva categoría")
    void nuevaCategoria_debeCrearCategoria() {
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria1);

        Categoria resultado = categoriaService.nuevaCategoria(categoria1);

        assertNotNull(resultado);
        assertEquals("Deportivos", resultado.getNombre());
        assertEquals("Calzado para deportes", resultado.getDescripcion());
        verify(categoriaRepository, times(1)).save(any(Categoria.class));
    }

    @Test
    @DisplayName("Debe buscar categoría por ID existente")
    void buscarCategoria_debeRetornarCategoria() {
        when(categoriaRepository.findById("cat1")).thenReturn(Optional.of(categoria1));

        Categoria resultado = categoriaService.buscarCategoria("cat1");

        assertNotNull(resultado);
        assertEquals("cat1", resultado.getIdCategoria());
        assertEquals("Deportivos", resultado.getNombre());
    }

    @Test
    @DisplayName("Debe retornar null cuando categoría no existe")
    void buscarCategoria_debeRetornarNullSiNoExiste() {
        when(categoriaRepository.findById("inexistente")).thenReturn(Optional.empty());

        Categoria resultado = categoriaService.buscarCategoria("inexistente");

        assertNull(resultado);
    }

    @Test
    @DisplayName("Debe eliminar categoría correctamente")
    void borrarCategoria_debeEliminarCategoria() {
        doNothing().when(categoriaRepository).deleteById("cat1");

        int resultado = categoriaService.borrarCategoria("cat1");

        assertEquals(1, resultado);
        verify(categoriaRepository, times(1)).deleteById("cat1");
    }

    @Test
    @DisplayName("Debe actualizar categoría existente")
    void nuevaCategoria_debeActualizarCategoria() {
        categoria1.setNombre("Deportivos Premium");
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria1);

        Categoria resultado = categoriaService.nuevaCategoria(categoria1);

        assertEquals("Deportivos Premium", resultado.getNombre());
    }
}
