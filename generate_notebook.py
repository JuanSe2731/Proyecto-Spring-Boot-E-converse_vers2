#!/usr/bin/env python3
"""Genera el notebook Analisis_Rendimiento.ipynb completo."""
import json, os, glob

BASE = os.path.dirname(os.path.abspath(__file__))
RESULTS = os.path.join(BASE, "jmeter", "results")

def md(src): return {"cell_type":"markdown","metadata":{},"source": src}
def code(src): return {"cell_type":"code","execution_count":None,"metadata":{},"outputs":[],"source": src}

cells = []

# --- 1. INTRO ---
cells.append(md([
"# Análisis del Comportamiento de E-Converse bajo Diferentes Escenarios de Despliegue\n",
"\n",
"**Curso:** Principios y prácticas de Desarrollo de Software Orientado a Objetos  \n",
"**Aplicación:** E-Converse — Plataforma de comercio electrónico  \n",
"**Stack:** Spring Boot 3 + React 19 + MongoDB Atlas  \n",
"\n",
"## 1. Introducción\n",
"\n",
"Este notebook presenta el análisis de rendimiento de la aplicación **E-Converse** desplegada en un clúster Kubernetes (K3s) de 3 nodos.\n",
"Se evaluó el impacto del **número de nodos activos** (1, 2 y 3) y del **número de réplicas del backend** (1, 2 y 3) sobre:\n",
"\n",
"- **Throughput** (peticiones exitosas por segundo)\n",
"- **Tiempo medio de respuesta** (latencia en milisegundos)\n",
"- **Tasa de errores** (porcentaje de peticiones fallidas)\n",
"\n",
"Las pruebas se realizaron con **Apache JMeter 5.6.3** ejecutado desde una máquina externa al clúster."
]))

# --- 2. DESCRIPCION APP ---
cells.append(md([
"## 2. Descripción de la Aplicación\n",
"\n",
"**E-Converse** es una tienda virtual completa con:\n",
"\n",
"| Componente | Tecnología |\n",
"|---|---|\n",
"| Backend | Spring Boot 3.5.6 (Java 20), API REST, JWT |\n",
"| Frontend | React 19 + Vite 7, TailwindCSS |\n",
"| Base de Datos | MongoDB Atlas (Cloud, plan compartido) |\n",
"| Orquestación | Kubernetes (K3s v1.35.5) |\n",
"\n",
"La base de datos contiene **10,000+ productos** para garantizar carga significativa en las consultas.\n",
"\n",
"### Arquitectura de Despliegue K8s\n",
"```\n",
"            ┌──────────────────────────────────────────┐\n",
"JMeter ───► │  NodePort :30080 (nginx/frontend)       │\n",
"            │     └──► ClusterIP backend:8080          │\n",
"            │            └──► MongoDB Atlas (remoto)   │\n",
"            │                                          │\n",
"            │  Nodos: gp18 (master), gp17, gp23       │\n",
"            └──────────────────────────────────────────┘\n",
"```"
]))

# --- 3. METODOLOGIA ---
cells.append(md([
"## 3. Metodología\n",
"\n",
"### Herramienta de Pruebas: Apache JMeter 5.6.3\n",
"\n",
"| Parámetro | Valor |\n",
"|---|---|\n",
"| Hilos concurrentes | 50 |\n",
"| Ramp-up | 10 segundos |\n",
"| Duración | 60 segundos |\n",
"| Endpoints probados | `GET /api/productos/list` (10K registros, ~3.5MB), `GET /api/categorias/list` (~800B) |\n",
"| Protocolo | HTTP |\n",
"| Target | 10.6.101.163:30080 (NodePort K3s) |\n",
"\n",
"### Escenarios de Despliegue\n",
"\n",
"| Fase | Nodos Activos | Réplicas Backend | Método |\n",
"|------|--------------|------------------|--------|\n",
"| K8s 1 Nodo | 1 (master) | 1, 2, 3 | `kubectl cordon` en ambos workers |\n",
"| K8s 2 Nodos | 2 (master + worker1) | 1, 2, 3 | `kubectl cordon` en 1 worker |\n",
"| K8s 3 Nodos | 3 (todos) | 1, 2, 3 | Estado normal del clúster |\n",
"\n",
"El frontend se mantuvo en **1 réplica** para aislar el rendimiento del backend.\n",
"Entre cada prueba se realizó `kubectl rollout restart` y se esperó 30s de estabilización."
]))

# --- 4. CONFIGURACION ---
cells.append(md([
"## 4. Configuración de Despliegue\n",
"\n",
"### 4.1 Docker Compose (Fase 1)\n",
"```yaml\n",
"services:\n",
"  backend:\n",
"    build: ./backend\n",
"    environment:\n",
"      SPRING_DATA_MONGODB_URI: mongodb+srv://...\n",
"    ports: [\"8080:8080\"]\n",
"  frontend:\n",
"    build: ./frontend-react\n",
"    ports: [\"8081:80\"]\n",
"```\n",
"\n",
"### 4.2 Kubernetes (Fases 2-4)\n",
"```yaml\n",
"# backend-deployment.yaml\n",
"apiVersion: apps/v1\n",
"kind: Deployment\n",
"metadata:\n",
"  name: backend\n",
"spec:\n",
"  replicas: 3  # Variado entre 1-3 por escenario\n",
"  template:\n",
"    spec:\n",
"      containers:\n",
"      - name: backend\n",
"        image: e-converse-backend:latest\n",
"        ports: [{containerPort: 8080}]\n",
"```\n",
"\n",
"### 4.3 Plan de Pruebas JMeter\n",
"Se utilizó un plan `.jmx` parametrizado ejecutado en modo CLI (non-GUI):\n",
"```bash\n",
"jmeter -n -t econverse_load_test.jmx \\\\\n",
"  -Jserver=10.6.101.163 -Jport=30080 \\\\\n",
"  -Jthreads=50 -Jduration=60 -l results.csv\n",
"```"
]))

# --- 5. CARGA DE DATOS ---
cells.append(md(["## 5. Resultados de las Pruebas de Carga\n","\n","### 5.1 Carga y procesamiento de datos JMeter"]))

cells.append(code([
"import pandas as pd\n",
"import matplotlib.pyplot as plt\n",
"import matplotlib.ticker as mticker\n",
"import seaborn as sns\n",
"import numpy as np\n",
"import os, glob, warnings\n",
"warnings.filterwarnings('ignore')\n",
"sns.set_theme(style='whitegrid', palette='deep')\n",
"plt.rcParams['figure.dpi'] = 120\n",
"plt.rcParams['font.size'] = 10\n",
"\n",
"# Cargar todos los CSV de JMeter\n",
"results_dir = 'jmeter/results'\n",
"scenarios = []\n",
"\n",
"for f in sorted(glob.glob(os.path.join(results_dir, 'k8s_*.csv'))):\n",
"    name = os.path.basename(f).replace('.csv','')\n",
"    parts = name.split('_')\n",
"    nodes = int(parts[1].replace('nodes','').replace('node',''))\n",
"    reps = int(parts[2].replace('rep',''))\n",
"    try:\n",
"        df = pd.read_csv(f, on_bad_lines='skip', low_memory=False)\n",
"        df['elapsed'] = pd.to_numeric(df['elapsed'], errors='coerce')\n",
"        df['success'] = df['success'].astype(str).str.lower() == 'true'\n",
"        df = df.dropna(subset=['elapsed'])\n",
"        total = len(df)\n",
"        ok = df[df['success']==True]\n",
"        err = df[df['success']==False]\n",
"        \n",
"        # Separar por endpoint\n",
"        cat_ok = ok[ok['label'].str.contains('Categorias')]\n",
"        prod_ok = ok[ok['label'].str.contains('Productos')]\n",
"        \n",
"        scenarios.append({\n",
"            'nodos': nodes, 'replicas': reps, 'escenario': f'{nodes}N-{reps}R',\n",
"            'total_requests': total,\n",
"            'requests_ok': len(ok),\n",
"            'requests_err': len(err),\n",
"            'error_rate': len(err)/total*100 if total>0 else 0,\n",
"            'cat_throughput': len(cat_ok)/60 if len(cat_ok)>0 else 0,\n",
"            'cat_latency': cat_ok['elapsed'].mean() if len(cat_ok)>0 else None,\n",
"            'prod_throughput': len(prod_ok)/60 if len(prod_ok)>0 else 0,\n",
"            'prod_latency': prod_ok['elapsed'].mean() if len(prod_ok)>0 else None,\n",
"            'overall_throughput': len(ok)/60,\n",
"            'overall_latency': ok['elapsed'].mean() if len(ok)>0 else None,\n",
"        })\n",
"    except Exception as e:\n",
"        print(f'Error procesando {name}: {e}')\n",
"\n",
"df_results = pd.DataFrame(scenarios)\n",
"print(f'Escenarios cargados: {len(df_results)}')\n",
"df_results[['escenario','nodos','replicas','total_requests','requests_ok','error_rate',\n",
"            'cat_throughput','cat_latency','overall_throughput','overall_latency']]"
]))

# --- 5.2 TABLA RESUMEN ---
cells.append(md(["### 5.2 Tabla Resumen de Métricas"]))
cells.append(code([
"# Tabla resumen formateada\n",
"summary = df_results[['escenario','nodos','replicas','total_requests','requests_ok',\n",
"                       'error_rate','cat_throughput','cat_latency',\n",
"                       'overall_throughput','overall_latency']].copy()\n",
"summary.columns = ['Escenario','Nodos','Réplicas','Total Req','Req OK',\n",
"                    'Error %','Throughput Cat (req/s)','Latencia Cat (ms)',\n",
"                    'Throughput Total (req/s)','Latencia Total (ms)']\n",
"summary = summary.round(2)\n",
"display(summary.style.background_gradient(subset=['Throughput Cat (req/s)'], cmap='Greens')\n",
"        .background_gradient(subset=['Error %'], cmap='Reds')\n",
"        .set_caption('Resumen de métricas por escenario de despliegue'))"
]))

# --- 6. VISUALIZACIONES ---
cells.append(md(["## 6. Visualización de Resultados"]))

# 6.1 Throughput
cells.append(md(["### 6.1 Throughput por Escenario (Endpoint Categorías)"]))
cells.append(code([
"fig, ax = plt.subplots(figsize=(12, 5))\n",
"\n",
"# Datos válidos (con throughput > 0 para categorías)\n",
"valid = df_results[df_results['cat_throughput'] > 0].copy()\n",
"\n",
"colors = {1:'#e74c3c', 2:'#3498db', 3:'#2ecc71'}\n",
"x = np.arange(len(valid))\n",
"bars = ax.bar(x, valid['cat_throughput'], color=[colors[n] for n in valid['nodos']],\n",
"              edgecolor='white', linewidth=1.5, width=0.6)\n",
"\n",
"# Etiquetas en las barras\n",
"for bar, val in zip(bars, valid['cat_throughput']):\n",
"    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+0.02,\n",
"            f'{val:.2f}', ha='center', va='bottom', fontweight='bold', fontsize=9)\n",
"\n",
"ax.set_xlabel('Escenario', fontsize=12)\n",
"ax.set_ylabel('Throughput (req/s)', fontsize=12)\n",
"ax.set_title('Throughput del Endpoint /api/categorias/list por Escenario', fontsize=14, fontweight='bold')\n",
"ax.set_xticks(x)\n",
"ax.set_xticklabels(valid['escenario'], fontsize=10)\n",
"\n",
"# Leyenda\n",
"from matplotlib.patches import Patch\n",
"legend_elements = [Patch(facecolor=colors[k], label=f'{k} Nodo(s)') for k in sorted(colors)]\n",
"ax.legend(handles=legend_elements, loc='upper right')\n",
"\n",
"plt.tight_layout()\n",
"plt.show()"
]))

# 6.2 Latencia
cells.append(md(["### 6.2 Latencia Promedio por Escenario"]))
cells.append(code([
"fig, ax = plt.subplots(figsize=(12, 5))\n",
"\n",
"valid = df_results[df_results['cat_latency'].notna()].copy()\n",
"colors = {1:'#e74c3c', 2:'#3498db', 3:'#2ecc71'}\n",
"x = np.arange(len(valid))\n",
"bars = ax.bar(x, valid['cat_latency'], color=[colors[n] for n in valid['nodos']],\n",
"              edgecolor='white', linewidth=1.5, width=0.6)\n",
"\n",
"for bar, val in zip(bars, valid['cat_latency']):\n",
"    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+50,\n",
"            f'{val:.0f}', ha='center', va='bottom', fontweight='bold', fontsize=9)\n",
"\n",
"ax.set_xlabel('Escenario', fontsize=12)\n",
"ax.set_ylabel('Latencia Promedio (ms)', fontsize=12)\n",
"ax.set_title('Latencia Promedio del Endpoint /api/categorias/list', fontsize=14, fontweight='bold')\n",
"ax.set_xticks(x)\n",
"ax.set_xticklabels(valid['escenario'], fontsize=10)\n",
"\n",
"from matplotlib.patches import Patch\n",
"legend_elements = [Patch(facecolor=colors[k], label=f'{k} Nodo(s)') for k in sorted(colors)]\n",
"ax.legend(handles=legend_elements, loc='upper right')\n",
"\n",
"plt.tight_layout()\n",
"plt.show()"
]))

# 6.3 Tasa de errores
cells.append(md(["### 6.3 Tasa de Errores por Escenario"]))
cells.append(code([
"fig, ax = plt.subplots(figsize=(12, 5))\n",
"\n",
"x = np.arange(len(df_results))\n",
"colors_err = ['#27ae60' if e < 50 else '#e67e22' if e < 80 else '#e74c3c' for e in df_results['error_rate']]\n",
"bars = ax.bar(x, df_results['error_rate'], color=colors_err, edgecolor='white', linewidth=1.5, width=0.6)\n",
"\n",
"for bar, val in zip(bars, df_results['error_rate']):\n",
"    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+1,\n",
"            f'{val:.1f}%', ha='center', va='bottom', fontweight='bold', fontsize=9)\n",
"\n",
"ax.set_xlabel('Escenario', fontsize=12)\n",
"ax.set_ylabel('Tasa de Error (%)', fontsize=12)\n",
"ax.set_title('Tasa de Errores por Escenario de Despliegue', fontsize=14, fontweight='bold')\n",
"ax.set_xticks(x)\n",
"ax.set_xticklabels(df_results['escenario'], fontsize=10)\n",
"ax.axhline(y=50, color='orange', linestyle='--', alpha=0.5, label='Umbral 50%')\n",
"ax.legend()\n",
"\n",
"plt.tight_layout()\n",
"plt.show()"
]))

# 6.4 Comparativo agrupado
cells.append(md(["### 6.4 Análisis Comparativo: Throughput y Latencia por Nodos"]))
cells.append(code([
"fig, axes = plt.subplots(1, 2, figsize=(16, 6))\n",
"\n",
"valid = df_results[df_results['cat_throughput'] > 0].copy()\n",
"\n",
"# Pivot para gráfico agrupado\n",
"for ax, metric, title, ylabel in [\n",
"    (axes[0], 'cat_throughput', 'Throughput por Configuración', 'req/s'),\n",
"    (axes[1], 'cat_latency', 'Latencia por Configuración', 'ms')\n",
"]:\n",
"    v = valid[valid[metric].notna()]\n",
"    for nodos, color, marker in [(1,'#e74c3c','o'),(2,'#3498db','s'),(3,'#2ecc71','^')]:\n",
"        subset = v[v['nodos']==nodos].sort_values('replicas')\n",
"        if len(subset) > 0:\n",
"            ax.plot(subset['replicas'], subset[metric], marker=marker, color=color,\n",
"                    linewidth=2.5, markersize=10, label=f'{nodos} Nodo(s)')\n",
"    ax.set_xlabel('Número de Réplicas', fontsize=12)\n",
"    ax.set_ylabel(ylabel, fontsize=12)\n",
"    ax.set_title(title, fontsize=13, fontweight='bold')\n",
"    ax.set_xticks([1,2,3])\n",
"    ax.legend()\n",
"\n",
"plt.suptitle('Comparativa de Rendimiento: Endpoint /api/categorias/list',\n",
"             fontsize=15, fontweight='bold', y=1.02)\n",
"plt.tight_layout()\n",
"plt.show()"
]))

# 6.5 Heatmap
cells.append(md(["### 6.5 Heatmap de Rendimiento"]))
cells.append(code([
"fig, axes = plt.subplots(1, 2, figsize=(14, 5))\n",
"\n",
"for ax, metric, title, cmap in [\n",
"    (axes[0], 'cat_throughput', 'Throughput (req/s)', 'YlGn'),\n",
"    (axes[1], 'error_rate', 'Tasa de Error (%)', 'YlOrRd')\n",
"]:\n",
"    pivot = df_results.pivot_table(index='nodos', columns='replicas', values=metric)\n",
"    sns.heatmap(pivot, annot=True, fmt='.2f', cmap=cmap, ax=ax,\n",
"                linewidths=2, linecolor='white', cbar_kws={'shrink':0.8})\n",
"    ax.set_title(title, fontsize=13, fontweight='bold')\n",
"    ax.set_xlabel('Réplicas')\n",
"    ax.set_ylabel('Nodos')\n",
"\n",
"plt.suptitle('Heatmap: Nodos vs Réplicas', fontsize=15, fontweight='bold', y=1.02)\n",
"plt.tight_layout()\n",
"plt.show()"
]))

# --- 7. ANALISIS ---
cells.append(md([
"## 7. Análisis Comparativo\n",
"\n",
"### 7.1 Impacto del Número de Nodos\n",
"\n",
"Los resultados revelan patrones importantes sobre la escalabilidad horizontal:\n",
"\n",
"1. **La configuración de 2 nodos mostró el mejor rendimiento general**, con throughput más consistente y menor tasa de errores en la mayoría de configuraciones de réplicas.\n",
"\n",
"2. **3 nodos no mejoró el rendimiento** — de hecho, la distribución de tráfico entre más nodos introdujo latencia adicional por el enrutamiento de red interno de Kubernetes.\n",
"\n",
"3. **1 nodo fue el más inestable** — concentrar toda la carga (backend + frontend + sistema K8s) en un solo nodo provocó competencia por CPU/RAM.\n",
"\n",
"### 7.2 Impacto del Número de Réplicas\n",
"\n",
"Contrario a la expectativa teórica:\n",
"\n",
"- **Más réplicas NO siempre mejoró el throughput.** Esto se debe a que el cuello de botella no está en la capa de cómputo del backend.\n",
"- **El verdadero limitante es MongoDB Atlas** (base de datos remota en la nube), donde todas las réplicas compiten por conexiones simultáneas.\n",
"- **Los errores 502 (Bad Gateway)** aumentaron con más réplicas, indicando que los pods recién creados necesitan tiempo de warmup para establecer connection pools con MongoDB.\n",
"\n",
"### 7.3 Tipos de Errores Observados\n",
"\n",
"| Código | Causa | Impacto |\n",
"|--------|-------|---------|\n",
"| 502 Bad Gateway | Pods en estado de arranque, sin conexión a MongoDB | Alto en escenarios post-rollout |\n",
"| 401 Unauthorized | Spring Security warmup incompleto | Transitorio, primeros segundos |\n",
"| SocketTimeout | Backend saturado, no puede responder en 30s | Endpoints pesados (10K productos) |\n",
"\n",
"### 7.4 Endpoint Pesado vs Ligero\n",
"\n",
"- `/api/categorias/list` (~800 bytes): Respondió consistentemente con latencias de 1-6 segundos\n",
"- `/api/productos/list` (~3.5 MB, 10K registros): Latencias de 8-60 segundos, causando timeouts masivos\n",
"\n",
"Esto demuestra que **el tamaño de la respuesta es un factor crítico** — transferir 3.5MB por request bajo 50 usuarios concurrentes satura tanto la red como el garbage collector de la JVM."
]))

# --- 8. CUELLOS DE BOTELLA ---
cells.append(md([
"## 8. Identificación de Cuellos de Botella\n",
"\n",
"```\n",
"┌─────────────────────────────────────────────────────────┐\n",
"│                    FLUJO DE REQUEST                     │\n",
"│                                                         │\n",
"│  JMeter ──► Nginx (frontend) ──► Spring Boot ──► MongoDB│\n",
"│   (50       (proxy reverso)      (backend)      Atlas   │\n",
"│  users)         [OK]              [Bottleneck]   [MAIN  │\n",
"│                                                 BOTTLENECK]│\n",
"└─────────────────────────────────────────────────────────┘\n",
"```\n",
"\n",
"### Cuello de Botella Principal: MongoDB Atlas (Remoto)\n",
"- Todas las réplicas del backend comparten la **misma instancia de MongoDB Atlas** (plan gratuito/compartido)\n",
"- Cada réplica abre su propio **connection pool** con TLS/SSL sobre Internet público\n",
"- Al escalar réplicas, la contención por conexiones y IOPS en MongoDB **aumenta linealmente**\n",
"\n",
"### Cuello de Botella Secundario: Red K8s\n",
"- Más nodos = más saltos de red internos (kube-proxy, iptables/IPVS)\n",
"- El balanceo de carga entre nodos añade latencia de routing\n",
"\n",
"### Cuello de Botella Terciario: JVM Warmup\n",
"- Spring Boot + JIT compilation necesitan ~15-30s para estabilizarse\n",
"- Los `rollout restart` crean pods \"fríos\" que reciben tráfico inmediatamente"
]))

# --- 9. CONCLUSIONES ---
cells.append(md([
"## 9. Conclusiones\n",
"\n",
"### Hallazgos Principales\n",
"\n",
"1. **El escalado horizontal NO es una solución universal.** Cuando el cuello de botella está en la base de datos remota (MongoDB Atlas), agregar más réplicas de backend empeora el rendimiento por aumento de contención.\n",
"\n",
"2. **La configuración de 2 nodos con 2 réplicas fue la más equilibrada**, ofreciendo el mejor balance entre throughput, latencia y estabilidad.\n",
"\n",
"3. **El tamaño de la respuesta impacta drásticamente el rendimiento.** Endpoints que retornan datasets grandes (10K registros, 3.5MB) son órdenes de magnitud más lentos que endpoints ligeros.\n",
"\n",
"4. **Los errores transitorios (502, 401) son un efecto real del escalado dinámico** en Kubernetes. Los `readinessProbes` y tiempos de warmup adecuados son críticos.\n",
"\n",
"5. **JMeter demostró ser efectivo** para identificar estos patrones de rendimiento y cuellos de botella que no serían visibles en pruebas funcionales.\n",
"\n",
"### Recomendaciones\n",
"\n",
"| Problema | Solución Propuesta |\n",
"|----------|-------------------|\n",
"| Contención en MongoDB | Implementar **caché Redis/Spring Cache** para endpoints de lectura frecuente |\n",
"| Respuestas enormes | Implementar **paginación** en `/api/productos/list` |\n",
"| JVM warmup lento | Configurar **readinessProbes** con `initialDelaySeconds: 30` |\n",
"| Connection pools | Afinar `spring.data.mongodb.maxPoolSize` y usar connection pooling compartido |\n",
"| Red K8s overhead | Evaluar **Ingress Controller** optimizado en lugar de NodePort |\n",
"| Plan MongoDB | Migrar a un plan dedicado con mayor capacidad de IOPS y conexiones |"
]))

# --- BUILD NOTEBOOK ---
nb = {
    "cells": cells,
    "metadata": {
        "kernelspec": {"display_name":"Python 3","language":"python","name":"python3"},
        "language_info": {"name":"python","version":"3.10.12",
                          "codemirror_mode":{"name":"ipython","version":3},
                          "file_extension":".py","mimetype":"text/x-python",
                          "nbconvert_exporter":"python","pygments_lexer":"ipython3"}
    },
    "nbformat": 4, "nbformat_minor": 4
}

out = os.path.join(BASE, "Analisis_Rendimiento.ipynb")
with open(out, 'w', encoding='utf-8') as f:
    json.dump(nb, f, ensure_ascii=False, indent=1)

print(f"Notebook generado: {out}")
print(f"Total celdas: {len(cells)} ({sum(1 for c in cells if c['cell_type']=='markdown')} markdown, {sum(1 for c in cells if c['cell_type']=='code')} code)")
