const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin1:mongo1@cluster0.elouxfb.mongodb.net/e_converse";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    
    // Check e_converse DB
    const db = client.db('e_converse');
    const productos = db.collection('producto');
    const usuarios = db.collection('usuario');
    const roles = db.collection('rol');
    
    const countProductos = await productos.countDocuments();
    const countUsuarios = await usuarios.countDocuments();
    const countRoles = await roles.countDocuments();

    console.log(`DB e_converse -> Productos: ${countProductos}, Usuarios: ${countUsuarios}, Roles: ${countRoles}`);
    
    // Check test DB (sometimes it defaults to test)
    const dbTest = client.db('test');
    const countTest = await dbTest.collection('producto').countDocuments();
    console.log(`DB test -> Productos: ${countTest}`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();