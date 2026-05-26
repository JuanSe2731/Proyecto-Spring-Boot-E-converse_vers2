# Guía para Video Explicativo — Proyecto E-Converse

Duración objetivo: **15–20 minutos**. La guía está organizada en bloques con tiempos, qué decir, qué mostrar en pantalla y los comandos a ejecutar en vivo. Cada bloque corresponde a una sección del proyecto.

---

## Antes de grabar

**Configuración del entorno:**
- Tener el clúster K3s corriendo y verificado: `kubectl get nodes` debe mostrar los 3 nodos `Ready`.
- Tener el backend desplegado y los pods en `Running` con la imagen sincronizada en los 3 nodos.
- Abrir varias terminales/ventanas:
  - **T1:** terminal local con el repositorio.
  - **T2:** SSH al master para mostrar `kubectl`.
  - **T3:** navegador con el notebook abierto en VS Code o Jupyter.
  - **T4:** navegador con la app (`http://<ip-master>:30080`).
- Tener el PDF `Reporte_Final.pdf` abierto en pestaña aparte.
- Pre-cargar los CSVs de `jmeter/results/` en una vista de archivos.

**Herramientas de grabación:**
- OBS Studio o similar. Resolución mínima: 1920×1080.
- Activar zoom de cursor / highlight para que se vean los comandos.
- Micrófono con filtro de ruido. Probar nivel antes.

**Tip de presentación:** habla en voz pausada, lee el comando en voz alta antes de presionar Enter, y deja unos segundos entre acción y acción para que el espectador pueda seguir.

---

## Bloque 1 — Introducción (1:30 min)

**Qué decir:**
> "Este video documenta el proyecto final del curso de Ingeniería de Software III. El objetivo fue analizar empíricamente cómo se comporta una aplicación bajo diferentes escenarios de despliegue, usando Docker, Kubernetes y Apache JMeter para medir el impacto del número de nodos y réplicas sobre el rendimiento."

**Qué mostrar:**
1. Portada del PDF `Reporte_Final.pdf`.
2. Diapositiva o nota con los 4 integrantes del equipo.
3. Una visualización rápida de la aplicación funcionando en el navegador (catálogo de productos, login, carrito).

**Acción concreta:**
- Mostrar en el navegador la URL `http://<ip-master>:30080`. Hacer un scroll por el catálogo.

---

## Bloque 2 — La Aplicación: E-Converse (2 min)

**Qué decir:**
> "E-Converse es una tienda virtual completa. El backend está en Spring Boot 3 con Java 20, expone una API REST con autenticación JWT y persiste todo en MongoDB Atlas. El frontend es una SPA en React 19 con Vite. Para las pruebas usamos dos endpoints que representan extremos opuestos: uno ligero, `categorias/list` que devuelve unos 800 bytes; y otro pesado, `productos/list` que devuelve 3.5 MB con 10 mil productos sin paginación."

**Qué mostrar:**
1. Estructura de carpetas del proyecto (VS Code con `tree -L 2`).
2. Brevísimo recorrido por `backend/src/main/java/backend/application/controller/`.
3. El `pom.xml` para mostrar Spring Boot 3.5.6.
4. La consulta cruda a los endpoints:

```bash
curl -s http://<ip-master>:30080/api/categorias/list | head -c 200
echo
curl -s -o /tmp/productos.json -w "HTTP %{http_code} | size=%{size_download} bytes\n" \
  http://<ip-master>:30080/api/productos/list
```

**Punto clave a comentar:**
> "Fíjense en la diferencia de tamaño: 800 bytes contra 3.5 megabytes. Esto va a ser determinante en los resultados."

---

## Bloque 3 — Fase 1: Docker Compose (1:30 min)

**Qué decir:**
> "La primera fase consiste en desplegar todo con Docker Compose en una sola máquina. Es la línea base contra la que vamos a comparar los escenarios de Kubernetes."

**Qué mostrar:**
1. Abrir `docker-compose.yml` y explicar los 2 servicios (backend con Spring Boot, frontend con nginx).
2. Mostrar el `Dockerfile` multi-stage de backend: explica que es un build de Maven y luego una imagen ligera con JRE.

**Comandos a ejecutar (opcional, si el master tiene docker compose v2):**

```bash
export SPRING_DATA_MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/e_converse"
docker compose up --build -d
docker compose ps
```

**Punto a comentar:**
> "En nuestro entorno el master no tenía instalado el plugin docker compose v2 — sólo el comando antiguo `docker-compose`. Por eso esta fase se documentó pero no se midió. La comparación principal del análisis es entre los 9 escenarios de Kubernetes."

---

## Bloque 4 — Fase 2-4: Kubernetes con K3s (3 min)

**Qué decir:**
> "Para las fases de Kubernetes usamos K3s, una distribución ligera de Kubernetes. El clúster es de 3 nodos: gp18 que es el master, y dos workers, gp17 y gp23. Para simular clústeres de menos nodos sin destruir la infraestructura, usamos `kubectl cordon` y `kubectl drain` para marcar nodos como no programables y mover los pods al resto."

**Qué mostrar:**
1. Estado actual del clúster:

```bash
sudo k3s kubectl get nodes -o wide
sudo k3s kubectl get pods -o wide
```

2. Los manifiestos YAML — abrir y explicar:

```yaml
# k8s/backend-deployment.yaml — punto clave: imagePullPolicy: Never
# k8s/frontend-deployment.yaml — punto clave: NodePort 30080
```

3. Demostrar el truco para simular menos nodos:

```bash
# Simular 2 nodos (cordonar gp23)
sudo k3s kubectl cordon gp23
sudo k3s kubectl drain gp23 --ignore-daemonsets --delete-emptydir-data --force
sudo k3s kubectl get pods -o wide   # Ahora todos los pods estan en gp18 y gp17

# Volver a 3 nodos
sudo k3s kubectl uncordon gp23
```

**Punto clave a comentar:**
> "Esto es importante: `cordon` evita que se programen nuevos pods en el nodo, pero los existentes siguen ahí. `drain` los expulsa además. Con esta combinación simulamos un clúster más pequeño sin tener que apagar máquinas."

4. Escalar réplicas:

```bash
sudo k3s kubectl scale deployment backend --replicas=2
sudo k3s kubectl rollout restart deployment backend
sudo k3s kubectl rollout status deployment backend
```

**Punto a comentar:**
> "Cada vez que escalamos hacemos `rollout restart` para que los pods se redistribuyan entre los nodos disponibles. Spring Boot tarda entre 30 y 60 segundos en estar realmente caliente — el JIT, el pool de conexiones a MongoDB, la inicialización del contexto. Por eso esperamos un warmup activo antes de medir."

---

## Bloque 5 — Pruebas de Carga con JMeter (CLI) (3 min)

**Qué decir:**
> "Para las pruebas de carga usamos Apache JMeter en modo no-GUI, parametrizado. JMeter tiene una interfaz gráfica para construir planes de prueba, pero en CI o en suites automatizadas se usa por línea de comandos."

**Qué mostrar:**

1. **El plan de pruebas** — abrir `jmeter/econverse_load_test.jmx` (mostrar XML brevemente, o abrirlo en la GUI de JMeter sólo para ver la estructura):

```
Test Plan
└── Thread Group (20 hilos, 20s ramp-up, 60s duración)
    ├── HTTP Request Defaults (timeout 60s)
    ├── HTTP Request: GET /api/productos/list
    ├── HTTP Request: GET /api/categorias/list
    └── Summary Report (output a CSV)
```

2. **Los parámetros configurables desde línea de comandos** (flag `-J`):

```
-Jserver      → servidor a probar
-Jport        → puerto
-Jthreads     → número de hilos concurrentes
-Jrampup      → tiempo para llegar a la carga máxima
-Jduration    → duración total
-Joutput      → ruta del CSV de resultados
```

3. **Ejecutar una prueba puntual en vivo:**

```bash
flatpak run org.apache.jmeter -n \
  -t jmeter/econverse_load_test.jmx \
  -l /tmp/demo.csv \
  -Jserver=10.6.101.163 -Jport=30080 \
  -Jthreads=20 -Jrampup=20 -Jduration=30
```

> Mientras corre, comentar: "Vemos que JMeter va emitiendo el resumen cada cierto tiempo: cantidad de samples, throughput, latencia promedio, tasa de errores. Al final escribe todo en el CSV línea por línea."

4. **Inspeccionar el CSV resultante:**

```bash
head -2 /tmp/demo.csv
# El header tiene: timeStamp,elapsed,label,responseCode,responseMessage,...
echo
echo "Total samples:"
wc -l /tmp/demo.csv
echo
# Resumen rápido por endpoint
python3 -c "
import csv, statistics
from collections import Counter
with open('/tmp/demo.csv') as f:
    rows = list(csv.DictReader(f))
codes = Counter(r['responseCode'] for r in rows)
print('Códigos HTTP:', dict(codes))
for label in set(r['label'] for r in rows):
    ok = [int(r['elapsed']) for r in rows if r['label']==label and r['success']=='true']
    if ok:
        print(f'  {label}: avg={statistics.mean(ok):.0f}ms throughput={len(ok)/30:.2f} req/s')
"
```

**Punto clave a comentar:**
> "JMeter no genera por sí solo throughput o latencia agregada. Lo que produce es la fila por cada request. Las métricas agregadas las calculamos después en pandas."

---

## Bloque 6 — Script de Automatización (2 min)

**Qué decir:**
> "Tenemos 9 escenarios para probar: 3 cantidades de nodos × 3 cantidades de réplicas. Hacer esto a mano es lento y propenso a errores, así que escribimos un script bash que automatiza todo el ciclo."

**Qué mostrar:**

1. Abrir `jmeter/run_all_tests.sh` y recorrer las funciones clave:
   - `ssh_master()` — ejecuta comandos remotos en el master vía sshpass.
   - `wait_for_ready()` — warmup activo: hace requests HTTP hasta obtener 3 × 200 consecutivos, luego espera 60 segundos adicionales.
   - `run_jmeter()` — invoca JMeter con los parámetros del escenario y guarda el CSV.
   - `scale_backend()` — combina escalado + rollout restart + espera.

2. La secuencia que ejecuta:

```bash
# El script hace esto, una vez por fase:
# FASE 4: K8s 3 Nodos      → 1, 2, 3 réplicas
# FASE 3: K8s 2 Nodos      → cordon gp23, luego 1, 2, 3 réplicas
# FASE 2: K8s 1 Nodo       → cordon gp17 + gp23, luego 1, 2, 3 réplicas
# Restauración: uncordon todos los nodos, 3 réplicas
```

3. Ejecutarlo en vivo si hay tiempo (mostrar sólo los primeros 5 minutos):

```bash
./jmeter/run_all_tests.sh | tee /tmp/run.log
```

4. Mostrar los CSVs generados:

```bash
ls -lh jmeter/results/
```

**Punto a comentar:**
> "Cada CSV tiene entre 100 y 500 muestras de los 60 segundos de prueba. Lo importante es que entre escenarios el clúster vuelve a un estado conocido — sin esto, el primer escenario contaminaría las métricas del siguiente."

---

## Bloque 7 — Problemas Encontrados y Soluciones (2 min)

**Qué decir:**
> "La primera corrida de las pruebas dio resultados malísimos: 6 de 9 escenarios con 100% de errores. En lugar de descartar los datos, los usamos para encontrar las causas raíz."

**Qué mostrar:**

1. Abrir `REPORTE_PROYECTO.md` y mostrar la sección 4 (Problemas Encontrados).

2. Los 3 problemas principales y cómo se diagnosticaron:

**Problema 1: HTTP 401 intermitentes (33% de errores)**

```bash
# Diagnostico: comparar imágenes entre nodos
for ip in 10.6.101.163 10.6.101.162 10.6.101.168; do
  echo "Node $ip:"
  ssh student1@$ip "sudo k3s ctr images ls | grep e-converse-backend"
done
# Resultado: gp23 tenía un SHA distinto (imagen vieja sin permitAll para /productos/list)

# Solución: re-importar la imagen correcta
ssh student1@<nodo-correcto> "sudo k3s ctr images export /tmp/backend.tar e-converse-backend:latest"
scp student1@<nodo-correcto>:/tmp/backend.tar /tmp/
scp /tmp/backend.tar student1@gp23:/tmp/
ssh student1@gp23 "sudo k3s ctr images import /tmp/backend.tar"
```

**Problema 2: HTTP 502 masivos en post-rollout**

> "Spring Boot necesita 30-60 segundos para tener el JIT caliente, el pool de MongoDB conectado y Spring Security inicializado. Si JMeter empieza a pegar antes, recibe 502 porque los pods aún no son `Ready` o el balanceo va a un pod cold."

**Solución:** warmup activo + 60s buffer en lugar de 30s fijos.

**Problema 3: SocketTimeoutException con 50 hilos**

> "50 hilos × 3.5 MB por request = 175 MB/s de tráfico. MongoDB Atlas con plan compartido + connection pool nuevo no aguantó. Reducir a 20 hilos dio métricas estables sin perder la capacidad de comparar escenarios."

3. Resultado tras los fixes:

```bash
# 0% errores en los 9 escenarios
python3 -c "
import csv, glob, os
for f in sorted(glob.glob('jmeter/results/*.csv')):
    with open(f) as fp:
        rows = list(csv.DictReader(fp))
    ok = sum(1 for r in rows if r['success']=='true')
    print(f'{os.path.basename(f):25s}  total={len(rows):4d}  ok={ok:4d}  err={len(rows)-ok}')
"
```

**Punto clave a comentar:**
> "Esto enseña algo importante: la calidad de los datos depende del entorno, no solo de la metodología. Si las pruebas las hubiéramos corrido sin diagnosticar estos problemas, las conclusiones serían completamente engañosas."

---

## Bloque 8 — Análisis de Resultados con Jupyter (3 min)

**Qué decir:**
> "El análisis vive en un notebook Jupyter. Cargamos los CSVs con pandas, calculamos throughput y latencia por escenario, y graficamos con matplotlib y seaborn."

**Qué mostrar:**

1. Abrir `Analisis_Rendimiento.ipynb` en VS Code o Jupyter.

2. Recorrer las secciones:
   - **Sección 5** — código de carga de CSVs y cálculo de métricas (cell 5).
   - **Sección 5.2** — tabla resumen con throughput y latencia de ambos endpoints, con gradientes de color.
   - **Sección 6.1** — gráficas de throughput (categorías vs productos lado a lado).
   - **Sección 6.2** — gráficas de latencia (mismo formato).
   - **Sección 6.4** — curvas comparativas: cómo escala cada endpoint con el número de réplicas, agrupado por nodos.
   - **Sección 6.5** — heatmaps en grid 2×2.
   - **Sección 7** — análisis comparativo escrito.

3. Lectura clave de las gráficas (señalar en vivo):

> "Miren el heatmap de la sección 6.5. El cuadro verde más intenso está en la celda **3 nodos / 2 réplicas** — ese es el sweet spot. Con 4.27 requests por segundo en el endpoint ligero y solo 294 milisegundos de latencia. Pero noten qué pasa al lado: 3 nodos con 3 réplicas baja a 3.27 req/s. Más recursos pero peor rendimiento."

4. Mostrar la conclusión principal en pantalla:

> "Hay 3 cuellos de botella en orden de importancia: primero MongoDB Atlas remoto, segundo los recursos del nodo bajo carga, tercero el tamaño del payload del endpoint de productos. El escalado horizontal funciona pero está topado por la base de datos."

---

## Bloque 9 — Conclusiones y Cierre (1 min)

**Qué decir:**
> "Los hallazgos principales del proyecto son cinco:
> 1. El escalado horizontal funciona, pero tiene un techo definido por el componente compartido — en nuestro caso MongoDB Atlas.
> 2. La mejor configuración es 3 nodos con 2 réplicas, no la más grande sino la más equilibrada.
> 3. Concentrar la carga en un solo nodo es siempre contraproducente.
> 4. El tamaño del payload domina sobre la topología — paginar el endpoint de productos sería la mejora con mejor retorno.
> 5. La metodología importa: sin un entorno estable (imágenes consistentes, warmup adecuado, carga calibrada), las métricas son ruido."

**Qué mostrar:**
1. La tabla final del PDF `Reporte_Final.pdf` (sección 7).
2. Lista de mejoras propuestas (sección de Recomendaciones del notebook).
3. Cerrar con la pantalla del repositorio y los créditos del equipo.

---

## Checklist de Cierre (post-grabación)

- [ ] Revisar audio: nivel constante, sin ruido de fondo.
- [ ] Verificar que se ven los comandos del terminal (no cortados).
- [ ] Subir el video a una plataforma (YouTube no listado, Vimeo, Drive con permiso).
- [ ] Añadir el enlace al `Reporte_Final.pdf` y al `README.md`.
- [ ] Capítulos en el video (timestamps) para navegación rápida.

---

## Plantilla de descripción del video

```
Proyecto Final — E-Converse: Análisis de Rendimiento bajo Diferentes
Escenarios de Despliegue (Docker + Kubernetes)

Curso: Ingeniería de Software III - UIS
Equipo:
- Juan Sebastián Otero (2220053)
- Daniel Santiago Convers (2221120)
- Juan David Paipa (2220062)
- Jhon Anderson Vargas (2220086)

Capítulos:
00:00 Introducción
01:30 La aplicación: E-Converse
03:30 Fase 1: Docker Compose
05:00 Fases 2-4: Kubernetes (K3s)
08:00 Pruebas de carga con JMeter (CLI)
11:00 Script de automatización
13:00 Problemas y soluciones
15:00 Análisis en Jupyter Notebook
18:00 Conclusiones

Repositorio: https://github.com/JuanSe2731/Proyecto-Spring-Boot-E-converse_vers2
```
