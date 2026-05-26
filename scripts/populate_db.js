const { MongoClient } = require('mongodb');

// The URI is hardcoded here temporarily for the assignment purposes
const uri = "mongodb+srv://admin1:mongo1@cluster0.elouxfb.mongodb.net/";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('e_converse');
    const productos = database.collection('producto');

    // Categorias mock para asociar
    const categoriasMock = [
      { _id: "cat1", nombre: "Deportivos" },
      { _id: "cat2", nombre: "Casuales" },
      { _id: "cat3", nombre: "Formales" }
    ];

    const batchSize = 1000;
    const totalRecords = 10000;
    
    console.log(`Borrando registros anteriores en producto...`);
    // Opcional: borrar previos si existían para asegurar 10000 exactos
    await productos.deleteMany({ nombre: { $regex: /^Producto Mock/ } });
    
    const count = await productos.countDocuments();
    console.log(`Hay ${count} productos actualmente.`);

    if (count >= totalRecords) {
        console.log("Ya existen suficientes registros. Terminando.");
        return;
    }
    
    const recordsToInsert = totalRecords - count;
    console.log(`Insertando ${recordsToInsert} productos en lotes de ${batchSize}...`);
    
    for (let i = 0; i < recordsToInsert; i += batchSize) {
      const batch = [];
      const currentBatchSize = Math.min(batchSize, recordsToInsert - i);

      for (let j = 0; j < currentBatchSize; j++) {
        const idNum = i + j + count + 1;
        const categoria = categoriasMock[idNum % categoriasMock.length];
        
        batch.push({
          nombre: `Producto Mock ${idNum}`,
          descripcion: `Descripción generada automáticamente para el producto ${idNum}. Ideal para uso de prueba de rendimiento.`,
          precio: Math.floor(Math.random() * 500000) + 50000,
          stock: Math.floor(Math.random() * 100) + 1,
          imagenUrl: `https://via.placeholder.com/300?text=Producto+${idNum}`,
          categoria: categoria
        });
      }
      
      await productos.insertMany(batch);
      console.log(`Lote ${Math.floor(i/batchSize) + 1} insertado (${batch.length} registros).`);
    }

    console.log(`¡Se alcanzó la meta de ${totalRecords} registros!`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
