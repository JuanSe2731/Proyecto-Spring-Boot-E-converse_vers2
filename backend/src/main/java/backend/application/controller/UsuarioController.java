package backend.application.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.application.model.Rol;
import backend.application.model.Usuario;
import backend.application.repository.RolRepository;
import backend.application.service.UsuarioService;


@RestController
@RequestMapping("usuario")
public class UsuarioController {
	
	@Autowired
	UsuarioService usuarioservice;
	
	@Autowired
	RolRepository rolRepository;
	
	@GetMapping("/list")
	public List<Usuario> cargarUsuarios(){
		List<Usuario> usuarios = usuarioservice.getUsuarios();
		System.out.println("📋 Listando usuarios desde la BD:");
		for (Usuario u : usuarios) {
			System.out.println("   - ID: " + u.getIdUsuario() + " | Nombre: " + u.getNombre() + " | Correo: " + u.getCorreo());
		}
		System.out.println("📊 Total de usuarios: " + usuarios.size());
		return usuarios;
	}
	
	@GetMapping("/list/{id}")
	public Usuario buscarId(@PathVariable String id){
		return usuarioservice.buscarUsuario(id);
	}
	
	@PostMapping("/new")
	public ResponseEntity<Usuario> agregar(@RequestBody Usuario usuario){
		// Si el rol viene con solo el ID, buscar el rol completo
		if (usuario.getRol() != null && usuario.getRol().getIdRol() != null) {
			Rol rolCompleto = rolRepository.findById(usuario.getRol().getIdRol()).orElse(null);
			usuario.setRol(rolCompleto);
		}
		Usuario obj = usuarioservice.nuevoUsuario(usuario);
		return new ResponseEntity<>(obj,HttpStatus.OK);
	}
	
	
	@PutMapping("/update")
	public ResponseEntity<?> editar(@RequestBody Usuario usuario){
		try {
			System.out.println("🔍 Recibiendo usuario para actualizar:");
			System.out.println("   - ID Usuario: " + usuario.getIdUsuario());
			System.out.println("   - Nombre: " + usuario.getNombre());
			System.out.println("   - Correo: " + usuario.getCorreo());
			System.out.println("   - Rol ID: " + (usuario.getRol() != null ? usuario.getRol().getIdRol() : "null"));
			
			if (usuario.getIdUsuario() == null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("El ID del usuario es requerido para actualizar");
			}
			
			Usuario obj = usuarioservice.buscarUsuario(usuario.getIdUsuario());
			System.out.println("🔎 Usuario encontrado en BD: " + (obj != null ? "SÍ" : "NO"));
			
			if (obj == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body("Usuario no encontrado con ID: " + usuario.getIdUsuario());
			}
			
			obj.setCorreo(usuario.getCorreo());
			obj.setDireccion(usuario.getDireccion());
			obj.setEstado(usuario.getEstado());
			obj.setNombre(usuario.getNombre());
			
			// Si el rol viene con solo el ID, buscar el rol completo
			if (usuario.getRol() != null && usuario.getRol().getIdRol() != null) {
				Rol rolCompleto = rolRepository.findById(usuario.getRol().getIdRol()).orElse(null);
				if (rolCompleto == null) {
					return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body("Rol no encontrado con ID: " + usuario.getRol().getIdRol());
				}
				obj.setRol(rolCompleto);
			}
			
			// Solo actualizar la contraseña si viene con un valor (nueva contraseña)
			String nuevaContrasena = usuario.getContrasena();
			if (nuevaContrasena != null && !nuevaContrasena.trim().isEmpty()) {
				// Asignar la nueva contraseña y encriptarla
				obj.setContrasena(nuevaContrasena);
				obj = usuarioservice.nuevoUsuario(obj); // Este método encripta la contraseña
			} else {
				// Si no hay nueva contraseña, guardar sin re-encriptar (mantiene la contraseña actual)
				obj = usuarioservice.actualizarUsuario(obj);
			}
			
			return new ResponseEntity<>(obj, HttpStatus.OK);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("Error al actualizar usuario: " + e.getMessage());
		}
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Usuario> eliminar(@PathVariable String id){
		System.out.println("🗑️ Recibiendo petición DELETE para ID: " + id);
		Usuario obj = usuarioservice.buscarUsuario(id);
		
		if(obj != null) {
			System.out.println("✅ Usuario encontrado, procediendo a eliminar: " + obj.getCorreo());
			usuarioservice.borrarUsuario(id);
			System.out.println("✅ Usuario eliminado exitosamente");
		}else {
			System.out.println("❌ Usuario NO encontrado con ID: " + id);
			return new ResponseEntity<>(obj,HttpStatus.INTERNAL_SERVER_ERROR);
			
		}
		return new ResponseEntity<>(obj,HttpStatus.OK);
	}

}
