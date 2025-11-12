package backend.application.service;

import java.util.List;

import backend.application.model.Usuario;

public interface IUsuarioService {
	
	List<Usuario> getUsuarios();
	
	Usuario nuevoUsuario(Usuario usuario);
	
	Usuario buscarUsuario(String id);
	
	int borrarUsuario(String id);
	
	Usuario actualizarUsuario(Usuario usuario);

}
