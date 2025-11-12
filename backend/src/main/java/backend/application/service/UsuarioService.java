package backend.application.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import backend.application.model.Usuario;
import backend.application.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService implements IUsuarioService{
	
	@Autowired
    private PasswordEncoder passwordEncoder;
	
	@Autowired
	UsuarioRepository usuarioRepository;

	@Override
	public List<Usuario> getUsuarios() {
		return usuarioRepository.findAll();
	}

	@Override
	public Usuario nuevoUsuario(Usuario usuario) {
		String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
        usuario.setContrasena(contrasenaEncriptada);
        // Guardar usuario en la BD
        return usuarioRepository.save(usuario);
	}

	@Override
	public Usuario buscarUsuario(String id) {
		System.out.println("🔍 Buscando usuario con ID: " + id + " (tipo: " + id.getClass().getName() + ")");
		
		// Intentar buscar en la lista primero
		List<Usuario> todos = usuarioRepository.findAll();
		System.out.println("📊 Total usuarios en BD: " + todos.size());
		
		Usuario usuarioEnLista = null;
		for (Usuario u : todos) {
			if (u.getIdUsuario().equals(id)) {
				usuarioEnLista = u;
				System.out.println("✅ Usuario encontrado en la lista: " + u.getNombre());
				break;
			}
		}
		
		// Buscar con findById
		Usuario usuario = usuarioRepository.findById(id).orElse(null);
		System.out.println("🔎 Resultado findById: " + (usuario != null ? "ENCONTRADO" : "NO ENCONTRADO"));
		
		// Si está en la lista pero findById no lo encuentra, usar el de la lista
		if (usuario == null && usuarioEnLista != null) {
			System.out.println("⚠️ PROBLEMA: Usuario está en lista pero findById no lo encuentra. Usando el de la lista.");
			return usuarioEnLista;
		}
		
		if (usuario != null) {
			System.out.println("   - Nombre: " + usuario.getNombre() + " | Correo: " + usuario.getCorreo());
		}
		return usuario;
	}

	@Override
	public int borrarUsuario(String id) {
		usuarioRepository.deleteById(id);
		return 1;
	}
	
	@Override
	public Usuario actualizarUsuario(Usuario usuario) {
		// Guardar sin re-encriptar la contraseña
		return usuarioRepository.save(usuario);
	}
}
