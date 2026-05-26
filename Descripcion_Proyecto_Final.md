# Proyecto Final: Análisis del Comportamiento de Aplicaciones bajo Diferentes Escenarios de Despliegue

* **Curso:** Principios y prácticas de Desarrollo de Software Orientado a Objetos
* **Instructor:** Gabriel Rodrigo Pedraza Ferreira
* **Fecha de Entrega:** Semana 16 del curso

---

## 1. Introducción

Este proyecto final se centra en el análisis empírico del comportamiento de una aplicación bajo distintos escenarios de despliegue, utilizando contenedores y las herramientas Docker y Kubernetes. Los estudiantes desplegarán la aplicación en configuraciones que varían desde un único servidor hasta clústeres de Kubernetes con diferentes niveles de escalabilidad (número de réplicas y nodos). El objetivo principal es observar y cuantificar métricas de rendimiento clave, como el tiempo medio de respuesta y el throughput, bajo diferentes cargas, para luego analizar cómo el entorno de despliegue impacta en la aplicación y extraer conclusiones sobre su escalabilidad y eficiencia.

---

## 2. Objetivo General

Analizar el comportamiento de una aplicación bajo diferentes escenarios de despliegue utilizando herramientas de contenedores como Docker y de orquestación de contenedores como Kubernetes, observando métricas de rendimiento y escalabilidad para comprender las implicaciones de cada configuración, especialmente en lo referente al escalado horizontal.

---

## 3. Objetivos Específicos

Al completar este proyecto, los estudiantes serán capaces de:

* Desplegar una aplicación utilizando Docker Compose en un entorno de una única máquina.
* Desplegar la misma aplicación en un clúster de Kubernetes usando un nodo, dos nodos y tres nodos, variando el número de réplicas de los servicios de la aplicación.
* Utilizar la herramienta JMeter para generar carga en la aplicación en cada escenario de despliegue y observar métricas clave como tiempo medio de respuesta y throughput (tasa de peticiones).
* Observar y registrar el comportamiento de las métricas bajo las diferentes cargas y el número de réplicas en cada escenario.
* Analizar las diferencias en el comportamiento de la aplicación entre los distintos escenarios de despliegue y las variaciones en el número de réplicas.
* Extraer conclusiones basadas en los datos observados sobre la escalabilidad, la eficiencia de recursos y las posibles limitaciones de cada escenario y configuración de réplicas.
* Documentar de manera clara y concisa el proceso de despliegue, las métricas observadas, el análisis realizado y las conclusiones obtenidas utilizando Notebooks de Jupyter (plataforma recomendada Colab).
* (Opcional) Configurar herramientas de monitorización (como Prometheus y Grafana) para observar métricas internas de la aplicación y la infraestructura (consumo de CPU, memoria RAM, etc.) en cada escenario de despliegue.

---

## 4. Descripción del Proyecto

Los estudiantes trabajarán con una aplicación que cumpla con las siguientes características:

* **Basada en Backend:** La aplicación debe tener una lógica de servidor significativa.
* **Acceso por API REST:** La interacción con la aplicación se realizará principalmente a través de una interfaz de Programación de Aplicaciones (API) que siga el estilo Representational State Transfer (REST). Esto permitirá realizar pruebas de carga de manera estandarizada.
* **Persistencia de Datos:** La aplicación debe interactuar con una base de datos o algún otro mecanismo de almacenamiento persistente para guardar y recuperar información.
* **Cantidad Importante de Datos:** La base de datos o el almacenamiento persistente debe contener una cantidad significativa de datos (mínimo 10K registros). Esto es crucial para observar cómo los diferentes escenarios de despliegue afectan el rendimiento de las operaciones de lectura y escritura, así como la latencia de las respuestas de la API.

### Fase 1: Despliegue con Docker Compose

* Crear un archivo docker-compose.yml para desplegar la aplicación y cualquier dependencia necesaria (por ejemplo, una base de datos).
* Desplegar la aplicación utilizando Docker Compose en una única máquina que debe ser diferente a la máquina donde se ejecute JMeter.
* (Opcional) Configurar herramientas básicas de monitorización a nivel de contenedor (por ejemplo, utilizando docker stats) o integrar Prometheus y un exporter si lo desean.
* Utilizar JMeter para generar una carga base en la aplicación y observar el tiempo medio de respuesta y el throughput.

### Fase 2: Despliegue en Kubernetes de un Solo Nodo con Variación de Réplicas

* Crear los archivos YAML de Kubernetes necesarios (Deployments, Services, etc.) para desplegar la misma aplicación.
* Desplegar la aplicación en un clúster de Kubernetes de un solo nodo (por ejemplo, utilizando Microk8s, K3s, Kind o un servicio Cloud autogestionado).
* Realizar pruebas con JMeter bajo diferentes números de réplicas para los servicios de la aplicación (por ejemplo, 1 réplica, 2 réplicas, 3 réplicas).
* Observar y registrar el tiempo medio de respuesta y el throughput para cada configuración de réplicas bajo diferentes niveles de carga.
* (Opcional) Integrar herramientas de monitorización como Prometheus y Grafana en el clúster para recolectar métricas de la aplicación y del nodo para cada configuración de réplicas.

### Fase 3: Despliegue en Kubernetes de Dos Nodos con Variación de Réplicas

* Configurar un clúster de Kubernetes que utilice dos nodos y desplegar la aplicación en el clúster de dos nodos.
* Realizar pruebas con JMeter bajo diferentes números de réplicas para los servicios de la aplicación (por ejemplo, 1 réplica, 2 réplicas, 3 réplicas).
* Observar y registrar el tiempo medio de respuesta y el throughput para cada configuración de réplicas bajo diferentes niveles de carga.
* (Opcional) Continuar la recolección de métricas con Prometheus y Grafana, observando cómo la distribución de la carga y la utilización de los recursos varían con el número de réplicas en un entorno de dos nodos.

### Fase 3: Despliegue en Kubernetes de Tres Nodos con Variación de Réplicas

* Configurar un clúster de Kubernetes que utilice tres nodos y desplegar la aplicación en el clúster de tres nodos.
* Realizar pruebas con JMeter bajo diferentes números de réplicas para los servicios de la aplicación (por ejemplo, 1 réplica, 2 réplicas, 3 réplicas).
* Observar y registrar el tiempo medio de respuesta y el throughput para cada configuración de réplicas bajo diferentes niveles de carga.
* (Opcional) Continuar la recolección de métricas con Prometheus y Grafana, observando cómo la distribución de la carga y la utilización de los recursos varían con el número de réplicas en un entorno de dos nodos.

### Fase 5: Análisis y Documentación con Notebooks de Jupyter

* Analizar comparativamente las métricas recolectadas con JMeter (tiempo medio de respuesta y throughput) en cada uno de los escenarios de despliegue y bajo las diferentes configuraciones de réplicas y niveles de carga.
* (Opcionalmente, incluir el análisis de las métricas internas recolectadas con Prometheus/Grafana si se utilizaron).
* Identificar tendencias, cuellos de botella y diferencias significativas en el comportamiento de la aplicación en función del número de réplicas and la cantidad de nodos.
* Documentar detalladamente cada paso del proceso de despliegue para cada escenario y configuración.
* Presentar el análisis de los resultados utilizando Notebooks de Jupyter (recomendado Google Colab), incluyendo visualizaciones (gráficos) generados directamente en el notebook para comparar las métricas entre los escenarios y las configuraciones de réplicas.
* Formular conclusiones claras y concisas sobre las implicaciones de cada escenario de despliegue y la variación de réplicas en términos de rendimiento, escalabilidad y utilización de recursos.
* Posibles recomendaciones basadas en el análisis.

---

## 6. Herramientas Sugeridas

* Docker y Docker Compose
* Kubernetes (MicroK8s, K3s o autogestionado en Cloud)
* kubectl
* Helm (opcional para la instalación de Prometheus y Grafana)
* JMeter
* Jupyter Notebook (con bibliotecas como Pandas, Matplotlib, Seaborn para el análisis y la visualización)
* (Opcional) Prometheus y Grafana
* [Otras herramientas que hayan sido relevantes en el curso]

---

## 7. Criterios de Evaluación

El proyecto final será evaluado en base a los siguientes criterios:

* Correcta implementación de los despliegues en cada uno de los escenarios y con las variaciones de réplicas.
* Uso adecuado de JMeter para la generación de carga y la recolección de métricas de rendimiento.
* (Opcional) Configuración adecuada de las herramientas de monitorización (Prometheus/Grafana) y la correcta recolección de métricas internas relevantes para las diferentes configuraciones de réplicas.
* Metodología rigurosa en la generación de carga y la observación del comportamiento de la aplicación bajo diferentes cargas y número de réplicas.
* Calidad y profundidad del análisis de las métricas (tiempo medio de respuesta y throughput) y la identificación de tendencias significativas utilizando Notebooks de Jupyter, considerando el impacto del número de réplicas y el número de nodos.
* (Opcionalmente, la calidad del análisis de las métricas internas si se recolectaron).
* Claridad y coherencia de las conclusiones basadas en los datos observados, especialmente en relación con la escalabilidad horizontal y las diferencias entre un nodo y dos nodos.
* Calidad de la documentación en los Notebooks de Jupyter, incluyendo la descripción del proceso, la presentación de las métricas (con visualizaciones) y el análisis realizado para cada escenario y configuración de réplicas.
* Uso adecuado de las herramientas y tecnologías aprendidas en el curso. [Posibles criterios adicionales específicos del curso]

---

## 8. Formato de Entrega

Los estudiantes deberán entregar un repositorio (por ejemplo, en GitHub o GitLab) que contenga:

* Un repositorio con el código fuente que incluya los archivos de cocración de imágenes (DocerkFile) los archivos de configuración de despliegue (archivos docker-compose.yml, archivos YAML de Kubernetes).
* Un documento reporte en PDF con instrucciones para ejecutar el proyecto, visualizar el notebook y los enlaces necesarios.
* Un Notebook de Jupyter (.ipynb) que incluya:
    * Una introducción al proyecto y los objetivos.
    * Una descripción detallada de la aplicación utilizada.
    * La configuración de despliegue para cada escenario y las variaciones de réplicas (con posible inclusión de los archivos de configuración).
    * (Opcional) La configuración de las herramientas de monitorización (si se utilizaron).
    * Una descripción de la metodología utilizada para generar carga con JMeter.
    * La presentación de las métricas observadas (tiempo medio de respuesta y throughput) para cada escenario y configuración de réplicas bajo diferentes cargas, incluyendo visualizaciones generadas con las bibliotecas de Python que muestren el impacto del número de réplicas y la diferencia entre uno y dos nodos.
    * (Opcional) La presentación de las métricas internas observadas con Prometheus/Grafana (con visualizaciones si se utilizaron) para las diferentes configuraciones de réplicas en uno y dos nodos.
    * Un análisis comparativo de los resultados entre los diferentes escenarios y configuraciones de réplicas.
    * Las conclusiones obtenidas sobre el comportamiento de la aplicación en cada escenario y la influencia del número de réplicas y el número de nodos en la escalabilidad.
    * Posibles recomendaciones basadas en el análisis.