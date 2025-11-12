package backend.application.model;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Document(collection = "categoria")
public class Categoria {

    @Id
    private String idCategoria;
    private String nombre;
    private String descripcion;
    @JsonIgnore
    private List<Producto> productos;

    
    // Constructor vacío requerido por JPA
    public Categoria() {}


	public Categoria(String idCategoria, String nombre, String descripcion, List<Producto> productos) {
		super();
		this.idCategoria = idCategoria;
		this.nombre = nombre;
		this.descripcion = descripcion;
		this.productos = productos;
	}


	public String getIdCategoria() {
		return idCategoria;
	}


	public void setIdCategoria(String idCategoria) {
		this.idCategoria = idCategoria;
	}


	public String getNombre() {
		return nombre;
	}


	public void setNombre(String nombre) {
		this.nombre = nombre;
	}


	public String getDescripcion() {
		return descripcion;
	}


	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}


	public List<Producto> getProductos() {
		return productos;
	}


	public void setProductos(List<Producto> productos) {
		this.productos = productos;
	}

    
}