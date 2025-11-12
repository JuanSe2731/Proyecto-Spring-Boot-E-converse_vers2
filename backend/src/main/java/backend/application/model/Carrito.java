package backend.application.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
//import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("carrito")
public class Carrito {

    @Id
    private String idCarrito;
    private Usuario usuario;
    private LocalDateTime fechaCreacion;
    private List<ItemCarrito> productos;
    
	public Carrito() {
		super();
	}

	public Carrito(String idCarrito, Usuario usuario, LocalDateTime fechaCreacion, List<ItemCarrito> productos) {
		super();
		this.idCarrito = idCarrito;
		this.usuario = usuario;
		this.fechaCreacion = fechaCreacion;
		this.productos = productos;
	}

	public String getIdCarrito() {
		return idCarrito;
	}

	public void setIdCarrito(String idCarrito) {
		this.idCarrito = idCarrito;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public List<ItemCarrito> getProductos() {
		return productos;
	}

	public void setProductos(List<ItemCarrito> productos) {
		this.productos = productos;
	}
    
	
	public BigDecimal getTotal() {
	    if (productos == null || productos.isEmpty()) {
	        return BigDecimal.ZERO;
	    }
	    return productos.stream()
	            .map(ItemCarrito::getSubtotal)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);
	}

    
    

    
}