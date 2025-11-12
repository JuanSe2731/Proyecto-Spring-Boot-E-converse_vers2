package backend.application.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
//import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "carritos")
public class Pedido {

    @Id
    private String idPedido;
    private Usuario usuario;
    private LocalDateTime fechaPedido;
    private List<ItemPedido> productos;
    private BigDecimal total;
    private String estado;
    
	public Pedido() {
		super();
	}

	public Pedido(String idPedido, Usuario usuario, LocalDateTime fechaPedido, List<ItemPedido> productos,
			BigDecimal total, String estado) {
		super();
		this.idPedido = idPedido;
		this.usuario = usuario;
		this.fechaPedido = fechaPedido;
		this.productos = productos;
		this.total = total;
		this.estado = estado;
	}

	public String getIdPedido() {
		return idPedido;
	}

	public void setIdPedido(String idPedido) {
		this.idPedido = idPedido;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public LocalDateTime getFechaPedido() {
		return fechaPedido;
	}

	public void setFechaPedido(LocalDateTime fechaPedido) {
		this.fechaPedido = fechaPedido;
	}

	public List<ItemPedido> getProductos() {
		return productos;
	}

	public void setProductos(List<ItemPedido> productos) {
		this.productos = productos;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

    
}