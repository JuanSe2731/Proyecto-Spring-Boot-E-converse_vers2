package backend.application.service;

import backend.application.model.Categoria;
import backend.application.model.Producto;
import backend.application.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductoService - Pruebas Unitarias")
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaService categoriaService;

    @InjectMocks
    private ProductoService productoService;

    private Producto producto1;
    private Producto producto2;
    private Categoria categoria;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setIdCategoria("cat1");
        categoria.setNombre("Deportivos");

        producto1 = new Producto();
        producto1.setIdProducto("prod1");
        producto1.setNombre("Nike Air Max");
        producto1.setDescripcion("Zapatillas deportivas");
        producto1.setPrecio(new BigDecimal("299990"));
        producto1.setStock(50);
        producto1.setCategoria(categoria);
        producto1.setImagenUrl("https://example.com/nike.jpg");

        producto2 = new Producto();
        producto2.setIdProducto("prod2");
        producto2.setNombre("Adidas Ultraboost");
        producto2.setDescripcion("Zapatillas running");
        producto2.setPrecio(new BigDecimal("349990"));
        producto2.setStock(30);
        producto2.setCategoria(categoria);
    }

    @Test
    @DisplayName("Debe listar todos los productos")
    void getProductos_debeRetornarListaDeProductos() {
        when(productoRepository.findAll()).thenReturn(Arrays.asList(producto1, producto2));

        List<Producto> resultado = productoService.getProductos();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("Nike Air Max", resultado.get(0).getNombre());
        assertEquals("Adidas Ultraboost", resultado.get(1).getNombre());
        verify(productoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe retornar lista vacía cuando no hay productos")
    void getProductos_debeRetornarListaVacia() {
        when(productoRepository.findAll()).thenReturn(List.of());

        List<Producto> resultado = productoService.getProductos();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    @Test
    @DisplayName("Debe crear un nuevo producto con categoría completa")
    void nuevoProducto_debeCrearProductoConCategoria() {
        when(categoriaService.buscarCategoria("cat1")).thenReturn(categoria);
        when(productoRepository.save(any(Producto.class))).thenReturn(producto1);

        Producto resultado = productoService.nuevoProducto(producto1);

        assertNotNull(resultado);
        assertEquals("Nike Air Max", resultado.getNombre());
        assertEquals("Deportivos", resultado.getCategoria().getNombre());
        verify(categoriaService, times(1)).buscarCategoria("cat1");
        verify(productoRepository, times(1)).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe crear producto sin categoría")
    void nuevoProducto_debeCrearProductoSinCategoria() {
        Producto productoSinCat = new Producto();
        productoSinCat.setNombre("Producto sin categoría");
        productoSinCat.setPrecio(new BigDecimal("100000"));

        when(productoRepository.save(any(Producto.class))).thenReturn(productoSinCat);

        Producto resultado = productoService.nuevoProducto(productoSinCat);

        assertNotNull(resultado);
        assertEquals("Producto sin categoría", resultado.getNombre());
        verify(categoriaService, never()).buscarCategoria(any());
    }

    @Test
    @DisplayName("Debe buscar producto por ID existente")
    void buscarProducto_debeRetornarProducto() {
        when(productoRepository.findById("prod1")).thenReturn(Optional.of(producto1));

        Producto resultado = productoService.buscarProducto("prod1");

        assertNotNull(resultado);
        assertEquals("prod1", resultado.getIdProducto());
        assertEquals("Nike Air Max", resultado.getNombre());
    }

    @Test
    @DisplayName("Debe retornar null cuando producto no existe")
    void buscarProducto_debeRetornarNullSiNoExiste() {
        when(productoRepository.findById("inexistente")).thenReturn(Optional.empty());

        Producto resultado = productoService.buscarProducto("inexistente");

        assertNull(resultado);
    }

    @Test
    @DisplayName("Debe eliminar producto correctamente")
    void borrarProducto_debeEliminarProducto() {
        doNothing().when(productoRepository).deleteById("prod1");

        int resultado = productoService.borrarProducto("prod1");

        assertEquals(1, resultado);
        verify(productoRepository, times(1)).deleteById("prod1");
    }

    @Test
    @DisplayName("Debe verificar precio del producto")
    void nuevoProducto_debeManejarPrecioCorrectamente() {
        when(categoriaService.buscarCategoria("cat1")).thenReturn(categoria);
        when(productoRepository.save(any(Producto.class))).thenReturn(producto1);

        Producto resultado = productoService.nuevoProducto(producto1);

        assertEquals(new BigDecimal("299990"), resultado.getPrecio());
    }

    @Test
    @DisplayName("Debe verificar stock del producto")
    void nuevoProducto_debeManejarStockCorrectamente() {
        when(categoriaService.buscarCategoria("cat1")).thenReturn(categoria);
        when(productoRepository.save(any(Producto.class))).thenReturn(producto1);

        Producto resultado = productoService.nuevoProducto(producto1);

        assertEquals(50, resultado.getStock());
    }
}
