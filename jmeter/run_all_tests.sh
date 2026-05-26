#!/bin/bash
# ==============================================================================
# Script de Automatizacion de Pruebas JMeter - E-Converse (v2)
# Parametros moderados: 20 hilos, ramp-up 20s, duracion 60s, warmup 60s
# Imagen backend sincronizada en los 3 nodos antes de ejecutar.
# ==============================================================================
# set -e desactivado a proposito: muchas operaciones (curl, grep filtros) pueden
# devolver !=0 sin que sea fatal para el flujo del benchmark.
set +e

# --- Configuracion ---
MASTER_IP="10.6.101.163"
MASTER_USER="student1"
MASTER_PASS="default"
NODEPORT=30080
JMETER_CMD="flatpak run org.apache.jmeter"
JMX_FILE="$(pwd)/jmeter/econverse_load_test.jmx"
RESULTS_DIR="$(pwd)/jmeter/results"
THREADS=20
RAMPUP=20
DURATION=60
WAIT_STABILIZE=60   # warmup post-rollout
WORKER1="gp17"
WORKER2="gp23"

mkdir -p "$RESULTS_DIR"

ssh_master() {
    sshpass -p "$MASTER_PASS" ssh -o StrictHostKeyChecking=no ${MASTER_USER}@${MASTER_IP} "$@"
}

log() {
    echo ""
    echo "======================================================================"
    echo "  $(date '+%Y-%m-%d %H:%M:%S') | $1"
    echo "======================================================================"
}

# Espera hasta que los pods esten Running + ready y endpoints respondan 200.
wait_for_ready() {
    local replicas=$1
    log "Esperando rollout (timeout 180s) y readiness de ${replicas} replicas..."
    ssh_master "sudo k3s kubectl rollout status deployment backend --timeout=180s" || true

    # Warmup HTTP: hacer requests hasta obtener 3 x 200 consecutivos o agotar 60s
    local ok=0
    local start=$(date +%s)
    while [ $ok -lt 3 ]; do
        local code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://${MASTER_IP}:${NODEPORT}/api/categorias/list || echo 000)
        if [ "$code" = "200" ]; then
            ok=$((ok+1))
        else
            ok=0
        fi
        local now=$(date +%s)
        if [ $((now - start)) -gt 60 ]; then
            echo "  -> Warmup HTTP excedio 60s (ultimo code=$code), continuando de todos modos"
            break
        fi
        sleep 2
    done

    # Espera adicional fija para que JIT/pool MongoDB se calienten
    sleep $WAIT_STABILIZE
    ssh_master "sudo k3s kubectl get pods -o wide --no-headers 2>/dev/null | grep -E 'backend|frontend' || true"
}

run_jmeter() {
    local scenario=$1
    local port=${2:-$NODEPORT}
    local output_file="${RESULTS_DIR}/${scenario}.csv"
    rm -f "$output_file"

    log "JMeter [${scenario}] ${THREADS} hilos, ramp ${RAMPUP}s, dur ${DURATION}s, puerto ${port}"

    $JMETER_CMD -n \
        -t "$JMX_FILE" \
        -l "$output_file" \
        -Jserver=${MASTER_IP} \
        -Jport=${port} \
        -Jthreads=${THREADS} \
        -Jrampup=${RAMPUP} \
        -Jduration=${DURATION} \
        2>&1 | tail -15

    local rows=$(($(wc -l < "$output_file") - 1))
    echo "  -> ${rows} muestras en ${output_file}"
}

scale_backend() {
    local replicas=$1
    log "Escalando backend a ${replicas} replicas + rollout restart"
    ssh_master "sudo k3s kubectl scale deployment backend --replicas=${replicas}"
    ssh_master "sudo k3s kubectl rollout restart deployment backend"
    wait_for_ready $replicas
}

# Frontend fijo en 1 replica para aislar rendimiento del backend
log "Inicializando: frontend a 1 replica, uncordon de workers"
ssh_master "sudo k3s kubectl uncordon $WORKER1 $WORKER2 2>/dev/null || true"
ssh_master "sudo k3s kubectl scale deployment frontend --replicas=1"
sleep 15

# ============================================================
# FASE 4: K8s 3 Nodos
# ============================================================
log "FASE 4: Kubernetes 3 Nodos"
for rep in 1 2 3; do
    scale_backend $rep
    run_jmeter "k8s_3nodes_${rep}rep"
done

# ============================================================
# FASE 3: K8s 2 Nodos (cordon worker2)
# ============================================================
log "FASE 3: Kubernetes 2 Nodos (cordon en $WORKER2)"
ssh_master "sudo k3s kubectl cordon $WORKER2"
ssh_master "sudo k3s kubectl drain $WORKER2 --ignore-daemonsets --delete-emptydir-data --force --grace-period=30 2>&1 | tail -3 || true"
sleep 15

for rep in 1 2 3; do
    scale_backend $rep
    run_jmeter "k8s_2nodes_${rep}rep"
done

# ============================================================
# FASE 2: K8s 1 Nodo (cordon ambos workers)
# ============================================================
log "FASE 2: Kubernetes 1 Nodo (cordon en $WORKER1 y $WORKER2)"
ssh_master "sudo k3s kubectl cordon $WORKER1"
ssh_master "sudo k3s kubectl drain $WORKER1 --ignore-daemonsets --delete-emptydir-data --force --grace-period=30 2>&1 | tail -3 || true"
sleep 15

for rep in 1 2 3; do
    scale_backend $rep
    run_jmeter "k8s_1node_${rep}rep"
done

# ============================================================
# FASE 1: Docker Compose
# ============================================================
log "FASE 1: Docker Compose en master"
ssh_master "sudo k3s kubectl uncordon $WORKER1 $WORKER2 2>/dev/null || true"

# Verificar docker compose disponible
if ssh_master "command -v docker > /dev/null && (docker compose version > /dev/null 2>&1 || sudo docker compose version > /dev/null 2>&1)"; then
    log "Docker compose detectado. Levantando stack..."
    ssh_master "mkdir -p ~/e-converse-deploy"
    sshpass -p "$MASTER_PASS" scp -o StrictHostKeyChecking=no \
        "$(pwd)/docker-compose.yml" \
        ${MASTER_USER}@${MASTER_IP}:/home/${MASTER_USER}/e-converse-deploy/docker-compose.yml

    # Levantar backend solo desde imagen ya importada en k3s (export e import a docker)
    ssh_master "sudo k3s ctr images export /tmp/backend.tar docker.io/library/e-converse-backend:latest && sudo docker load -i /tmp/backend.tar && cd ~/e-converse-deploy && sudo SPRING_DATA_MONGODB_URI='${MONGO_URI:-mongodb+srv://admin1:mongo1@cluster0.elouxfb.mongodb.net/e_converse}' docker compose up -d backend 2>&1 | tail -5" || echo "  Docker compose up fallo (no critico)"
    sleep 60

    run_jmeter "docker_compose_1rep" 8080

    ssh_master "cd ~/e-converse-deploy && sudo docker compose down 2>&1 | tail -3" || true
else
    log "Docker compose no disponible en master. Saltando Fase 1."
fi

# ============================================================
# Restaurar estado
# ============================================================
log "Restaurando cluster (3 nodos, 3 replicas)"
ssh_master "sudo k3s kubectl scale deployment backend --replicas=3"
ssh_master "sudo k3s kubectl scale deployment frontend --replicas=3"
ssh_master "sudo k3s kubectl rollout status deployment backend --timeout=120s" || true
ssh_master "sudo k3s kubectl get pods -o wide"

log "OK - Pruebas completadas"
ls -la "${RESULTS_DIR}"/*.csv
