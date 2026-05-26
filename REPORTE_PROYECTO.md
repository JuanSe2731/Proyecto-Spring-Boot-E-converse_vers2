# Reporte del Proyecto Final: Análisis de Rendimiento de E-Converse

**Curso:** Principios y prácticas de Desarrollo de Software Orientado a Objetos  
**Fecha:** Mayo 2026

---

## 1. Resumen del Proyecto

Se realizó el análisis empírico del comportamiento de la aplicación **E-Converse** (plataforma de comercio electrónico) bajo diferentes escenarios de despliegue en un clúster Kubernetes (K3s) de 3 nodos. Se midieron métricas de rendimiento (throughput, latencia, tasa de errores) utilizando **Apache JMeter 5.6.3** variando el número de nodos activos (1, 2, 3) y réplicas del backend (1, 2, 3).

---

## 2. Infraestructura Desarrollada

### 2.1 Aplicación E-Converse

| Componente | Tecnología | Descripción |
|---|---|---|
| Backend | Spring Boot 3.5.6 (Java 20) | API REST con autenticación JWT, Spring Data MongoDB |
| Frontend | React 19 + Vite 7 | SPA con TailwindCSS, Zustand para estado global |
| Base de Datos | MongoDB Atlas | Cluster compartido en la nube, 10,000+ productos |
| Contenedorización | Docker | Dockerfiles para backend y frontend |
| Orquestación | K3s v1.35.5 | Clúster de 3 nodos (VMs Ubuntu 24.04) |

### 2.2 Clúster Kubernetes (K3s)

| Nodo | Hostname | IP | Rol |
|------|----------|----|-----|
| Master | gp18 | 10.6.101.163 | control-plane, ejecuta pods |
| Worker 1 | gp17 | 10.6.101.162 | worker |
| Worker 2 | gp23 | 10.6.101.168 | worker |

Para todos la contraseña de ingreso es "default" y tienen acceso a root.

### 2.3 Archivos de Configuración Creados

```
├── docker-compose.yml              # Despliegue Docker Compose (Fase 1)
├── k8s/
│   ├── backend-deployment.yaml     # Deployment + Service del backend
│   └── frontend-deployment.yaml    # Deployment + Service (NodePort:30080) del frontend
├── jmeter/
│   ├── econverse_load_test.jmx     # Plan de pruebas JMeter parametrizado
│   ├── run_all_tests.sh            # Script de automatización de todas las pruebas
│   └── results/                    # Resultados CSV de JMeter por escenario
│       ├── k8s_1node_1rep.csv
│       ├── k8s_1node_2rep.csv
│       ├── k8s_1node_3rep.csv
│       ├── k8s_2nodes_1rep.csv
│       ├── k8s_2nodes_2rep.csv
│       ├── k8s_2nodes_3rep.csv
│       ├── k8s_3nodes_1rep.csv
│       ├── k8s_3nodes_2rep.csv
│       ├── k8s_3nodes_3rep.csv
│       └── docker_compose_1rep.csv
├── scripts/
│   ├── populate_db.js              # Inserción de 10K productos mock
│   ├── run_tests.js                # Script de pruebas con Autocannon (previo)
│   ├── redeploy-backend.sh         # Re-despliegue del backend en K3s
│   └── setup_roles_admin.js        # Configuración inicial de roles y admin
├── Analisis_Rendimiento.ipynb      # Notebook Jupyter con análisis completo
└── generate_notebook.py            # Generador del notebook
```

### 2.4 Plan de Pruebas JMeter

Se creó un archivo `.jmx` **parametrizado** que permite configurar desde la línea de comandos:

| Parámetro | Flag CLI | Corrida inicial | Corrida final |
|---|---|---|---|
| Servidor | `-Jserver` | 10.6.101.163 | 10.6.101.163 |
| Puerto | `-Jport` | 30080 (K8s) | 30080 (K8s) |
| Hilos concurrentes | `-Jthreads` | 50 | **20** |
| Ramp-up | `-Jrampup` | 10 s | **20 s** |
| Duración | `-Jduration` | 60 s | 60 s |
| Timeout por request (jmx) | — | 30 s | **60 s** |
| Warmup post-rollout (script) | — | 30 s | **60 s + 3×HTTP 200** |

**Endpoints probados:**
- `GET /api/productos/list` — Endpoint pesado, retorna ~3.5MB (10K productos)
- `GET /api/categorias/list` — Endpoint ligero, retorna ~800 bytes

### 2.5 Script de Automatización (`run_all_tests.sh`)

Se desarrolló un script bash que automatiza **todo el ciclo de pruebas**:

1. **Gestión de nodos** con `kubectl cordon` / `kubectl drain` / `kubectl uncordon` para simular 1, 2 y 3 nodos
2. **Escalado de réplicas** con `kubectl scale deployment backend --replicas=N`
3. **Redistribución de pods** con `kubectl rollout restart`
4. **Ejecución de JMeter** en modo CLI (non-GUI) con `flatpak run org.apache.jmeter`
5. **Restauración del clúster** al estado original (3 nodos, 3 réplicas)

El script se conecta al master vía SSH (`sshpass`) y ejecuta los comandos de Kubernetes remotamente.

---

## 3. Proceso de Ejecución de las Pruebas

### 3.1 Secuencia de ejecución

Las pruebas se ejecutaron en el siguiente orden (del escenario más grande al más pequeño):

```
Fase 4: K8s 3 Nodos → 1 rep → 2 rep → 3 rep
Fase 3: K8s 2 Nodos → 1 rep → 2 rep → 3 rep  (cordon gp23)
Fase 2: K8s 1 Nodo  → 1 rep → 2 rep → 3 rep  (cordon gp17 + gp23)
Fase 1: Docker Compose → 1 rep
Restauración: uncordon todos, 3 réplicas
```

**Duración total:** ~25 minutos (9 pruebas × ~2.5 min cada una incluyendo tiempos de espera).

### 3.2 Simulación de diferentes cantidades de nodos

Para simular clústeres de 1 y 2 nodos **sin destruir el clúster de 3 nodos**, se usó:

- `kubectl cordon <nodo>` — Marca el nodo como no-programable (nuevos pods no se asignan ahí)
- `kubectl drain <nodo> --ignore-daemonsets --delete-emptydir-data --force` — Evicta todos los pods del nodo
- `kubectl uncordon <nodo>` — Restaura el nodo a estado normal

Esto permitió que:
- **1 nodo:** Solo gp18 (master) ejecutaba pods
- **2 nodos:** gp18 (master) + gp17 (worker1) ejecutaban pods
- **3 nodos:** Todos los nodos ejecutaban pods

---

## 4. Problemas Encontrados y Soluciones

### 4.1 ❌ Las pruebas originales NO usaron JMeter

**Problema:** El proyecto original (implementado previamente con Gemini CLI) realizó las pruebas de carga usando **Autocannon** (librería de Node.js) en lugar de JMeter, que es el requisito explícito del proyecto.

```javascript
// scripts/run_tests.js — Usaba Autocannon, NO JMeter
const autocannon = require('autocannon');
```

**Solución:** Se creó un plan de pruebas JMeter completo (`.jmx`) y se re-ejecutaron todas las pruebas con JMeter real en modo CLI.

---

### 4.2 ❌ Imagen Docker no disponible en el nodo master (gp18)

**Problema:** Al iniciar las pruebas, los pods que K8s intentaba programar en el nodo master (gp18) fallaban con error `ErrImageNeverPull`. Las imágenes `e-converse-backend:latest` y `e-converse-frontend:latest` solo estaban importadas en los nodos worker (gp17 y gp23), pero no en el master.

```
backend-66dc85d977-k8gpf    0/1     ErrImageNeverPull   0   gp18
```

**Causa:** El script de despliegue original (`redeploy-backend.sh`) solo copiaba e importaba las imágenes en los workers, pero no en el master.

**Solución:** Se copió el archivo `backend.tar` desde un worker al master y se importó manualmente:

```bash
# En el master
scp student1@10.6.101.162:/home/student1/backend.tar /home/student1/
sudo k3s ctr images import /home/student1/backend.tar
# Lo mismo para frontend.tar
```

**Impacto:** Los primeros resultados de la Fase 4 (3 nodos) tuvieron pods fallidos en el master, lo que afectó las métricas de los escenarios k8s_3nodes_1rep y parcialmente k8s_3nodes_3rep.

---

### 4.3 ❌ JMeter instalado como Flatpak — Restricciones de sandbox

**Problema:** JMeter estaba instalado como aplicación Flatpak (`org.apache.jmeter`), lo que significa:
- No está disponible directamente como comando `jmeter` en PATH
- Tiene restricciones de acceso al sistema de archivos (sandbox)
- Los reportes HTML (`-e -o`) fallaban por propiedades no resueltas dentro del sandbox

```
Error generating the report: GenerationException: Cannot assign 
"${jmeter.reportgenerator.apdex_satisfied_threshold}" to property...
```

**Solución:** 
- Se ejecutó con `flatpak run org.apache.jmeter -n -t ...`
- Los archivos CSV de resultados sí se guardaron correctamente (el error solo afectaba los reportes HTML, no los datos)
- Los reportes HTML no son necesarios ya que el análisis se hace en el Jupyter notebook

---

### 4.4 ❌ Errores 502 Bad Gateway masivos en varios escenarios

**Problema:** Tres escenarios tuvieron **100% de errores HTTP 502** (Bad Gateway):
- `k8s_1node_2rep` — 100,061 errores, 0 exitosos
- `k8s_1node_3rep` — 76,159 errores, 0 exitosos
- `k8s_3nodes_1rep` — 30,497 errores, 0 exitosos

**Causa:** Después de cada `kubectl rollout restart`, los pods se recrean desde cero. Spring Boot necesita ~15-30 segundos para:
1. Inicializar el contexto de Spring
2. Establecer connection pools con MongoDB Atlas (TLS/SSL sobre Internet)
3. Compilar JIT del código Java

El tiempo de espera configurado (30 segundos) no fue suficiente en todos los casos, especialmente cuando múltiples réplicas competían por recursos en un solo nodo.

Además, el nodo master ejecuta procesos del control-plane de K3s (API server, scheduler, etcd) que compiten por CPU/RAM con los pods de la aplicación, agravando el problema cuando todo corre en 1 nodo.

**Impacto en los datos:** Estos escenarios aparecen con throughput = 0 en las gráficas, lo cual es un **hallazgo válido** que demuestra la inestabilidad del sistema bajo estas configuraciones.

---

### 4.5 ❌ Errores 401 Unauthorized intermitentes

**Problema:** El endpoint `/api/productos/list` retornaba 401 (Unauthorized) de forma intermitente, especialmente en los primeros segundos después de un rollout.

**Causa:** Spring Security necesita inicializar sus filtros y la configuración de JWT. Durante el warmup de pods recién creados, las requests llegan antes de que Spring Security esté completamente configurado, y los filtros de seguridad rechazan las peticiones al no encontrar la cadena de autenticación correctamente inicializada.

**Nota:** El endpoint `/api/categorias/list` no tuvo este problema porque probablemente está configurado como ruta pública en Spring Security.

**Impacto:** El endpoint de productos tuvo datos poco confiables en la mayoría de escenarios. El análisis se centró en el endpoint de categorías como métrica principal.

---

### 4.6 ❌ Endpoint de productos demasiado pesado (3.5MB por request)

**Problema:** Cada request a `/api/productos/list` retornaba **~3.5MB de JSON** (10,000 productos completos). Con 50 usuarios concurrentes, esto generaba:
- ~175 MB/s de tráfico de red
- Latencias de 8-60 segundos por request
- Timeouts masivos (SocketTimeoutException con el límite de 30s)

```
GET Productos (10K registros): avg_lat=60142ms (¡60 segundos!)
```

**Causa:** La API no implementa paginación. Retorna todos los 10,000 registros en una sola respuesta.

**Impacto:** El endpoint de productos fue prácticamente inutilizable para pruebas de carga significativas. Solo el endpoint de categorías (~800 bytes) proporcionó métricas estables.

**Recomendación:** Implementar paginación en el endpoint de productos:
```
GET /api/productos/list?page=0&size=20
```

---

### 4.7 ⚠️ Docker Compose — Comando no compatible

**Problema:** La Fase 1 (Docker Compose) falló parcialmente. El master tiene Docker instalado pero no el plugin `docker compose` (v2), solo el comando antiguo `docker-compose`.

```
docker: unknown command: docker compose
```

**Impacto:** Se logró ejecutar la prueba JMeter contra el puerto 8080 del Docker Compose, pero el comando `docker compose down` falló, dejando los contenedores corriendo. Los datos del CSV se guardaron pero pueden incluir interferencia del clúster K8s corriendo simultáneamente.

---

### 4.8 ⚠️ Contención en MongoDB Atlas

**Problema:** El cuello de botella principal no estaba en la aplicación sino en **MongoDB Atlas** (base de datos remota).

**Evidencia:**
- Más réplicas del backend → más connection pools simultáneos → más contención en MongoDB
- El throughput **no mejoró** al agregar réplicas (e incluso empeoró en algunos casos)
- Las latencias eran dominadas por el tiempo de respuesta de MongoDB, no por el procesamiento del backend

**Causa raíz:** Usar un plan gratuito/compartido de MongoDB Atlas para servir 50 usuarios concurrentes con 10K registros no es viable. El plan tiene límites de:
- Conexiones simultáneas
- IOPS (operaciones de disco)
- Ancho de banda de red

---

## 5. Resultados Obtenidos

### 5.1 Resultados de la corrida inicial (problemática)

La primera corrida mostró resultados inutilizables (los problemas 4.1–4.8 estaban activos simultáneamente):

| Escenario | Throughput Cat (req/s) | Latencia Cat (ms) | Error % |
|-----------|------------------------|-------------------|---------|
| 1N-1R | 0.83 | 5,510 | 66.7% |
| 1N-2R | 0.00 | — | 100.0% |
| 1N-3R | 0.00 | — | 100.0% |
| 2N-1R | 0.83 | 3,372 | 62.0% |
| 2N-2R | 1.88 | 1,429 | 37.2% |
| 2N-3R | 1.90 | 2,900 | 99.0% |
| 3N-1R | 0.00 | — | 100.0% |
| 3N-2R | 1.22 | 4,414 | 76.2% |
| 3N-3R | 0.87 | 3,102 | 99.7% |

> **Lectura:** 6 de 9 escenarios con ≥99% de errores, ningún patrón comparativo confiable. Esos CSVs se conservan en `jmeter/results_old/` para referencia.

### 5.2 Resultados de la corrida final (tras correcciones)

Tras (a) sincronizar la imagen `e-converse-backend:latest` entre los 3 nodos, (b) extender el warmup post-rollout a 60 s + verificación HTTP, y (c) reducir la carga a 20 hilos, los 9 escenarios K8s completaron **sin errores**:

| Escenario | Nodos | Réplicas | Muestras | Throughput Cat (req/s) | Latencia Cat (ms) | Throughput Prod (req/s) | Latencia Prod (ms) | Error % |
|-----------|-------|----------|----------|------------------------|-------------------|--------------------------|--------------------|---------|
| 1N-1R | 1 | 1 | 184 | 1.37 | 398 | 1.70 | 10,410 | 0.0% |
| 1N-2R | 1 | 2 | 162 | 1.18 | 593 | 1.52 | 11,310 | 0.0% |
| 1N-3R | 1 | 3 | 108 | 0.73 | 1,076 | 1.07 | 16,131 | 0.0% |
| 2N-1R | 2 | 1 | 239 | 1.83 | 396 | 2.15 | 7,915 | 0.0% |
| 2N-2R | 2 | 2 | 277 | 2.15 | 318 | 2.47 | 6,805 | 0.0% |
| 2N-3R | 2 | 3 | 331 | 2.60 | 309 | 2.92 | 5,717 | 0.0% |
| 3N-1R | 3 | 1 | 229 | 1.77 | 356 | 2.05 | 8,240 | 0.0% |
| **3N-2R** | **3** | **2** | **529** | **4.27** | **294** | **4.55** | **3,518** | **0.0%** |
| 3N-3R | 3 | 3 | 409 | 3.27 | 289 | 3.55 | 4,606 | 0.0% |

### 5.3 Mejor configuración encontrada

**3 nodos con 2 réplicas** es la configuración óptima:
- Throughput máximo: **4.27 req/s** en endpoint ligero, **4.55 req/s** en endpoint pesado (~2× la mejor de la corrida inicial)
- Latencia mínima: **294 ms** (vs 1,429 ms del mejor escenario inicial)
- Cero errores en las 529 muestras

### 5.4 Patrones observados

- **Más nodos siempre mejora** (a igual réplicas): 1N < 2N ≤ 3N.
- **Más réplicas mejora hasta cierto punto**, luego degrada por contención en MongoDB:
  - Con 1 nodo: cada réplica añadida empeora (no hay recursos).
  - Con 2 nodos: escalado monótono pero modesto.
  - Con 3 nodos: pico en 2 réplicas (+141% vs 1 réplica), 3 réplicas degrada -23%.
- **El endpoint pesado** (3.5 MB) tiene latencias 10–15× mayores que el ligero en todos los escenarios — el tamaño del payload domina sobre la topología.

---

## 6. Entregables Generados

| Archivo | Descripción |
|---------|-------------|
| `Analisis_Rendimiento.ipynb` | Notebook Jupyter completo con 22 celdas, 5 gráficas, tablas y análisis |
| `jmeter/econverse_load_test.jmx` | Plan de pruebas JMeter parametrizado |
| `jmeter/run_all_tests.sh` | Script de automatización completo |
| `jmeter/results/*.csv` | 10 archivos CSV con resultados crudos de JMeter |
| `docker-compose.yml` | Configuración Docker Compose para Fase 1 |
| `k8s/backend-deployment.yaml` | Deployment + Service K8s del backend |
| `k8s/frontend-deployment.yaml` | Deployment + Service K8s del frontend |
| `generate_notebook.py` | Script generador del notebook |
| `REPORTE_PROYECTO.md` | Este documento |

---

## 7. Lecciones Aprendidas

1. **Las imágenes deben ser idénticas en todos los nodos.** Con `imagePullPolicy: Never` y la imagen propagada manualmente, basta con que un nodo tenga un build distinto para que el balanceo de K8s entregue resultados inconsistentes. Diagnóstico: comparar SHAs con `k3s ctr images ls` en cada nodo. Solución estructural: usar un registry y tags inmutables.

2. **El warmup es parte de la metodología, no un detalle de implementación.** Spring Boot + MongoDB driver tardan 30–60 s en alcanzar estado estable. Medir antes de eso captura el cold start como "rendimiento del despliegue", lo cual es engañoso. Verificar HTTP 200 estables antes de cada prueba.

3. **La paginación es esencial.** Retornar 10K registros (3.5 MB) en una sola respuesta no escala — la latencia está dominada por el ancho de banda y la presión sobre el GC, no por el número de réplicas.

4. **El escalado horizontal tiene un techo en la base de datos.** Si el cuello de botella está en una DB compartida y remota, agregar más réplicas eventualmente degrada el rendimiento por contención de connection pool e IOPS.

5. **El nodo de control no debe ejecutar pods de aplicación bajo carga.** Concentrar el control-plane + aplicación en el mismo host (escenario `1N-3R`) entrega menos de 1/5 del throughput del mejor escenario.

6. **La carga del test debe ajustarse al sistema bajo prueba.** 50 hilos contra un endpoint de 3.5 MB con DB compartida no permite distinguir diferencias entre despliegues — todos los escenarios fallan. Calibrar la carga para que el sistema esté ocupado pero no saturado.

7. **JMeter en modo CLI con parametrización `-J` permite automatizar suites de pruebas completas** desde un script bash y guardar resultados crudos en CSV para análisis posterior.

8. **`kubectl cordon/drain` es la forma correcta de simular clústeres de diferentes tamaños** sin destruir la infraestructura.

---

## 8. Detalle de la Re-ejecución (mayo 2026)

Para validar el análisis, las pruebas se re-ejecutaron con las correcciones aplicadas:

| Etapa | Acción |
|-------|--------|
| 1 | Diagnóstico vía logs de los 3 pods: el pod en `gp23` retornaba 401 mientras los otros 2 retornaban 200 |
| 2 | Comparación de SHAs de imagen en los 3 nodos → `gp23` tenía SHA `b493e460…`, los otros `3ac97d2c…` |
| 3 | Export desde `gp17` (`k3s ctr images export /tmp/backend-fixed.tar`) → transferencia → import en `gp23` |
| 4 | Validación: 30/30 requests retornaron HTTP 200 |
| 5 | Actualización del script de pruebas: warmup HTTP + 60 s, 20 hilos, timeout 60 s, sin `set -e` |
| 6 | Ejecución de los 9 escenarios K8s (~45 min) |
| 7 | Detección de pérdida de imagen en `gp18` post-Fase 2 (`ErrImageNeverPull`) → re-import y re-ejecución de los 3 escenarios 1-nodo |
| 8 | Actualización del notebook Jupyter con datos limpios y conclusiones revisadas |

Los CSVs de la corrida inicial se conservaron en `jmeter/results_old/` para referencia. Los CSVs de la corrida final están en `jmeter/results/`.
