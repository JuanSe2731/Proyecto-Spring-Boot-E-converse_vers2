package backend.application.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Producto - Pruebas del Modelo")
class ProductoTest {

    @Test
    @DisplayName("Debe crear producto con constructor vacío")
    void constructorVacio_debeFuncionar() {
        Producto producto = new Producto();
        assertNotNull(producto);
        assertNull(producto.getIdProducto());
        assertNull(producto.getNombre());
    }

    @Test
    @DisplayName("Debe crear producto con constructor completo")
    void constructorCompleto_debeAsignarTodosLosCampos() {
        Categoria categoria = new Categoria();
        categoria.setIdCategoria("cat1");
        categoria.setNombre("Deportivos");

        Producto producto = new Producto(
            "prod1", categoria, "Nike Air Max",
            "Zapatillas deportivas", new BigDecimal("299990"),
            50, "https://example.com/nike.jpg"
        );

        assertEquals("prod1", producto.getIdProducto());
        assertEquals("Nike Air Max", producto.getNombre());
        assertEquals("Zapatillas deportivas", producto.getDescripcion());
        assertEquals(new BigDecimal("299990"), producto.getPrecio());
        assertEquals(50, producto.getStock());
        assertEquals("https://example.com/nike.jpg", producto.getImagenUrl());
        assertEquals("Deportivos", producto.getCategoria().getNombre());
    }

    @Test
    @DisplayName("Debe establecer y obtener nombre")
    void setGetNombre_debeFuncionar() {
        Producto producto = new Producto();
        producto.setNombre("Puma RS-X");
        assertEquals("Puma RS-X", producto.getNombre());
    }

    @Test
    @DisplayName("Debe establecer y obtener precio")
    void setGetPrecio_debeFuncionar() {
        Producto producto = new Producto();
        producto.setPrecio(new BigDecimal("199990"));
        assertEquals(new BigDecimal("199990"), producto.getPrecio());
    }

    @Test
    @DisplayName("Debe establecer y obtener stock")
    void setGetStock_debeFuncionar() {
        Producto producto = new Producto();
        producto.setStock(100);
        assertEquals(100, producto.getStock());
    }

    @Test
    @DisplayName("Debe establecer y obtener categoría")
    void setGetCategoria_debeFuncionar() {
        Producto producto = new Producto();
        Categoria cat = new Categoria();
        cat.setNombre("Casuales");
        producto.setCategoria(cat);
        assertEquals("Casuales", producto.getCategoria().getNombre());
    }

    @Test
    @DisplayName("Debe establecer y obtener URL de imagen")
    void setGetImagenUrl_debeFuncionar() {
        Producto producto = new Producto();
        producto.setImagenUrl("https://example.com/img.png");
        assertEquals("https://example.com/img.png", producto.getImagenUrl());
    }

    @Test
    @DisplayName("Debe manejar precio con decimales")
    void precio_debeManejarDecimales() {
        Producto producto = new Producto();
        producto.setPrecio(new BigDecimal("99999.99"));
        assertEquals(new BigDecimal("99999.99"), producto.getPrecio());
    }

    @Test
    @DisplayName("Debe manejar stock cero")
    void stock_debeManejarCero() {
        Producto producto = new Producto();
        producto.setStock(0);
        assertEquals(0, producto.getStock());
    }
}
