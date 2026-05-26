const autocannon = require('autocannon');
const { execSync } = require('child_process');
const fs = require('fs');

const url = 'http://10.6.101.163:30080/api/categorias/list';
const results = [];

async function runTest(replicas) {
  console.log(`\n======================================`);
  console.log(`Escalando backend a ${replicas} réplicas...`);
  execSync(`sshpass -p 'default' ssh -o StrictHostKeyChecking=no student1@10.6.101.163 "sudo k3s kubectl scale deployment backend --replicas=${replicas}"`);
  
  console.log('Esperando 20 segundos a que los pods se estabilicen...');
  execSync('sleep 20');

  console.log(`Iniciando prueba de carga para ${replicas} réplicas (duración: 20s)...`);
  const result = await autocannon({
    url,
    connections: 50,
    pipelining: 1,
    duration: 20
  });

  console.log(`Resultados para ${replicas} réplicas:`);
  console.log(` - Throughput (req/s): ${result.requests.average}`);
  console.log(` - Latencia Promedio (ms): ${result.latency.average}`);
  
  results.push({
    replicas,
    throughput: result.requests.average,
    latency: result.latency.average
  });
}

async function main() {
  try {
    await runTest(1);
    await runTest(2);
    await runTest(3);
    
    fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
    console.log('\nPruebas completadas y guardadas en test_results.json');
  } catch (err) {
    console.error("Error durante las pruebas:", err);
  }
}

main();