package backend.application.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "rol")
public class Rol {
    
	@Id
    private String idRol;    
    private String nombre;

    
    // Constructor vacío (obligatorio para JPA)
    public Rol() {}


	public Rol(String idRol, String nombre) {
		super();
		this.idRol = idRol;
		this.nombre = nombre;
	}


	public String getIdRol() {
		return idRol;
	}


	public void setIdRol(String idRol) {
		this.idRol = idRol;
	}


	public String getNombre() {
		return nombre;
	}


	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

    

    
}