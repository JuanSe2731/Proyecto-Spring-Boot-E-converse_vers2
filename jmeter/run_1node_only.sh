#!/bin/bash
# Re-ejecuta solo la Fase 2 (Kubernetes 1 nodo) ahora que las imagenes
# estan re-importadas en el master.
set +e

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
WAIT_STABILIZE=60
WORKER1="gp17"
WORKER2="gp23"

ssh_master() {
    sshpass -p "$MASTER_PASS" ssh -o StrictHostKeyChecking=no ${MASTER_USER}@${MASTER_IP} "$@"
}

log() {
    echo ""
    echo "======================================================================"
    echo "  $(date '+%Y-%m-%d %H:%M:%S') | $1"
    echo "======================================================================"
}

wait_for_ready() {
    log "Esperando rollout y readiness..."
    ssh_master "sudo k3s kubectl rollout status deployment backend --timeout=180s" || true

    local ok=0 start=$(date +%s)
    while [ $ok -lt 3 ]; do
        local code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://${MASTER_IP}:${NODEPORT}/api/categorias/list || echo 000)
        if [ "$code" = "200" ]; then ok=$((ok+1)); else ok=0; fi
        local now=$(date +%s)
        if [ $((now - start)) -gt 90 ]; then
            echo "  -> Warmup HTTP excedio 90s (ultimo code=$code), continuando"
            break
        fi
        sleep 2
    done
    sleep $WAIT_STABILIZE
    ssh_master "sudo k3s kubectl get pods -o wide --no-headers 2>/dev/null | grep -E 'backend|frontend' || true"
}

run_jmeter() {
    local scenario=$1
    local output_file="${RESULTS_DIR}/${scenario}.csv"
    rm -f "$output_file"
    log "JMeter [${scenario}] ${THREADS} hilos, ramp ${RAMPUP}s, dur ${DURATION}s"
    $JMETER_CMD -n \
        -t "$JMX_FILE" \
        -l "$output_file" \
        -Jserver=${MASTER_IP} -Jport=${NODEPORT} \
        -Jthreads=${THREADS} -Jrampup=${RAMPUP} -Jduration=${DURATION} \
        2>&1 | tail -10
    local rows=$(($(wc -l < "$output_file") - 1))
    echo "  -> ${rows} muestras"
}

scale_backend() {
    local replicas=$1
    log "Escalando backend a ${replicas} replicas"
    ssh_master "sudo k3s kubectl scale deployment backend --replicas=${replicas}"
    ssh_master "sudo k3s kubectl rollout restart deployment backend"
    wait_for_ready
}

# Estado inicial: cordonar ambos workers
log "FASE 2: K8s 1 Nodo (cordonando $WORKER1 y $WORKER2)"
ssh_master "sudo k3s kubectl cordon $WORKER1 $WORKER2"
ssh_master "sudo k3s kubectl drain $WORKER1 --ignore-daemonsets --delete-emptydir-data --force --grace-period=30 2>&1 | tail -3 || true"
ssh_master "sudo k3s kubectl drain $WORKER2 --ignore-daemonsets --delete-emptydir-data --force --grace-period=30 2>&1 | tail -3 || true"
sleep 20

for rep in 1 2 3; do
    scale_backend $rep
    run_jmeter "k8s_1node_${rep}rep"
done

# Restaurar
log "Restaurando cluster (3 nodos, 3 replicas)"
ssh_master "sudo k3s kubectl uncordon $WORKER1 $WORKER2"
ssh_master "sudo k3s kubectl scale deployment backend --replicas=3"
ssh_master "sudo k3s kubectl rollout restart deployment backend"
ssh_master "sudo k3s kubectl rollout status deployment backend --timeout=120s" || true
ssh_master "sudo k3s kubectl get pods -o wide"

log "OK - Fase 2 completada"
ls -la "${RESULTS_DIR}"/k8s_1node_*.csv
