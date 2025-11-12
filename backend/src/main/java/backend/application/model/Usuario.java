package backend.application.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;


@Document(collection = "usuario")
public class Usuario {

    @Id
    private String idUsuario;
    
    private Rol rol;
    
    private Carrito carrito;
    
    private List<Pedido> pedidos;

    private String nombre;
    private String correo;
    private String contrasena;
    private String direccion;
    private Boolean estado;

    // Constructor vacío (requerido por JPA)
    public Usuario() {}

	public Usuario(String idUsuario, Rol rol, Carrito carrito, List<Pedido> pedidos, String nombre, String correo,
			String contrasena, String direccion, Boolean estado) {
		super();
		this.idUsuario = idUsuario;
		this.rol = rol;
		this.carrito = carrito;
		this.pedidos = pedidos;
		this.nombre = nombre;
		this.correo = correo;
		this.contrasena = contrasena;
		this.direccion = direccion;
		this.estado = estado;
	}

	public String getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(String idUsuario) {
		this.idUsuario = idUsuario;
	}

	public Rol getRol() {
		return rol;
	}

	public void setRol(Rol rol) {
		this.rol = rol;
	}

	public Carrito getCarrito() {
		return carrito;
	}

	public void setCarrito(Carrito carrito) {
		this.carrito = carrito;
	}

	public List<Pedido> getPedidos() {
		return pedidos;
	}

	public void setPedidos(List<Pedido> pedidos) {
		this.pedidos = pedidos;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getCorreo() {
		return correo;
	}

	public void setCorreo(String correo) {
		this.correo = correo;
	}

	public String getContrasena() {
		return contrasena;
	}

	public void setContrasena(String contrasena) {
		this.contrasena = contrasena;
	}

	public String getDireccion() {
		return direccion;
	}

	public void setDireccion(String direccion) {
		this.direccion = direccion;
	}

	public Boolean getEstado() {
		return estado;
	}

	public void setEstado(Boolean estado) {
		this.estado = estado;
	}

    
}