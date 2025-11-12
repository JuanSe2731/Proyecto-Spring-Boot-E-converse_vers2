package backend.application.model;

import java.math.BigDecimal;

public class ItemCarrito {

    private String idProducto;
    private String nombreProducto;
    private BigDecimal precioUnitario;
    private Integer cantidad;
    private BigDecimal subtotal;
	
    public ItemCarrito() {
		super();
	}
    
    

	public ItemCarrito(String idProducto, String nombreProducto, BigDecimal precioUnitario, Integer cantidad) {
		super();
		this.idProducto = idProducto;
		this.nombreProducto = nombreProducto;
		this.precioUnitario = precioUnitario;
		this.cantidad = cantidad;
	}



	public ItemCarrito(String idProducto, String nombreProducto, BigDecimal precioUnitario, Integer cantidad,
			BigDecimal subtotal) {
		super();
		this.idProducto = idProducto;
		this.nombreProducto = nombreProducto;
		this.precioUnitario = precioUnitario;
		this.cantidad = cantidad;
		this.subtotal = subtotal;
	}

	public String getIdProducto() {
		return idProducto;
	}

	public void setIdProducto(String idProducto) {
		this.idProducto = idProducto;
	}

	public String getNombreProducto() {
		return nombreProducto;
	}

	public void setNombreProducto(String nombreProducto) {
		this.nombreProducto = nombreProducto;
	}

	public BigDecimal getPrecioUnitario() {
		return precioUnitario;
	}

	public void setPrecioUnitario(BigDecimal precioUnitario) {
		this.precioUnitario = precioUnitario;
	}

	public Integer getCantidad() {
		return cantidad;
	}

	public void setCantidad(Integer cantidad) {
		this.cantidad = cantidad;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(BigDecimal subtotal) {
		this.subtotal = subtotal;
	}
    
    
    
    
    
}
