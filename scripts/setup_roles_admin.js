const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://admin1:mongo1@cluster0.elouxfb.mongodb.net/e_converse";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('e_converse');
    const roles = db.collection('rol');
    const usuarios = db.collection('usuario');
    
    // Insert roles
    await roles.deleteMany({});
    await roles.insertMany([
      { _id: "1", nombre: "Administrador", _class: "backend.application.model.Rol" },
      { _id: "2", nombre: "Cliente", _class: "backend.application.model.Rol" }
    ]);
    console.log("Roles insertados correctamente.");

    // Create Admin user
    const adminEmail = "admin@admin.com";
    await usuarios.deleteMany({ correo: adminEmail });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin", salt);
    
    await usuarios.insertOne({
      _id: "admin-id-1234",
      nombre: "Admin",
      correo: adminEmail,
      contrasena: hashedPassword,
      direccion: "Oficina Principal",
      estado: true,
      rol: { _id: "1", nombre: "Administrador" },
      _class: "backend.application.model.Usuario"
    });
    console.log("Usuario admin creado correctamente.");

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();