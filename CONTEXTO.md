Contexto: El equipo de desarrollo está trabajando en una aplicación que se actualiza
frecuentemente. Para automatizar el proceso de entrega de nuevas versiones y asegurar la calidad
del software, es necesario implementar un pipeline de Integración Continua y Entrega Continua
(CI/CD). Este pipeline debe construir automáticamente la aplicación, ejecutar pruebas para verificar
su correcto funcionamiento y desplegarla en un entorno de pruebas o producción ante cada cambio
en el código fuente, minimizando la intervención manual y acelerando el ciclo de vida del software.

Objetivo: Comprender y configurar un pipeline de Integración Continua y Entrega Continua (CI/CD)
automatizado para la construcción, prueba y despliegue de una aplicación.

Descripción: Los estudiantes deberán seleccionar y configurar una herramienta de CI/CD (GitHub Actions), explorando sus conceptos fundamentales como
stages, jobs y artifacts. El pipeline que definan debe activarse al detectar commits en una rama
específica de un repositorio de código gestionado con Git. Las etapas mínimas requeridas son: clonar
el repositorio, construir una imagen Docker de la aplicación utilizando un Dockerfile, ejecutar
pruebas unitarias y/o de integración para asegurar la calidad del código antes del despliegue,
etiquetar y subir la imagen Docker construida a un registro de contenedores accesible (como Docker
Hub o un registro privado), y finalmente, desplegar la nueva versión de la aplicación en un entorno
de destino (que puede ser local simulado con Docker Compose o un clúster de Kubernetes de
desarrollo). Se espera que implementen un sistema básico de notificaciones (por correo electrónico
o una plataforma de mensajería) para informar sobre el éxito o fallo de cada etapa del pipeline y
que exploren mecanismos para gestionar de forma segura cualquier secreto necesario para el
proceso (como credenciales de registro o claves de despliegue) utilizando las funcionalidades de la
herramienta de CI/CD.

Consideraciones: Proporcionar ejemplos de archivos de configuración del pipeline (.github/workflows/main.yml) para las herramientas sugeridas, asegurar que los
estudiantes tengan acceso a cuentas gratuitas o de prueba en las herramientas de CI/CD y a un
registro de contenedores, ofrecer un repositorio de código de ejemplo sencillo con una aplicación
básica y algunas pruebas unitarias, fomentar una discusión sobre diferentes estrategias de
branching en Git (Gitflow, GitHub Flow) y cómo se integran con el pipeline de CI/CD, y animar a la
exploración de conceptos como la creación y gestión de artefactos del pipeline

Link al repositorio de la aplicación (el archivo de CONTEXTO está en la carpeta raiz): https://github.com/JuanSe2731/Proyecto-Spring-Boot-E-converse_vers2.git 

Recuerda hacer una rama nueva para el pipeline y no tocar la rama principal.

Informe: Realiza un informe en latex que deje espacios para adjuntar imagenes acerca del código que se va a explicar y de como esta organizado el proyecto en general. Puedes guiarte teniendo como ejemplo este informe para un taller anterior ( este informe es de un trabajo anterior ):

\documentclass[12pt,a4paper]{article}

\usepackage[spanish]{babel}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{geometry}
\usepackage{setspace}
\usepackage{graphicx}
\usepackage{float}
\usepackage{hyperref}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{caption}

\geometry{margin=2.5cm}
\onehalfspacing
\hypersetup{colorlinks=true, linkcolor=blue, urlcolor=blue}

\lstdefinestyle{bashstyle}{
  basicstyle=\ttfamily\small,
  breaklines=true,
  frame=single,
  backgroundcolor=\color{gray!8}
}

\title{Informe de Implementación\\Arquitectura Event-Driven Multilenguaje con RabbitMQ y Docker}
\author{Juan Sebastian Otero Vega - 2220053 \\ Farid Camilo Rojas Vargas - 2220051\\ Juan David Pallares Pallares - 2220079}
\date{Abril 2026}

\begin{document}
\maketitle

\begin{center}
    Link del Código: \url{https://github.com/JuanSe2731/Taller-Event-Driven-Multilenguaje-con-RabbitMQ-y-Docker.git}
\end{center}

\begin{center}
    Link del Video: \url{https://youtu.be/qlZVSE8a53M}
\end{center}

\newpage

% ============================================================
\section{Introducción}
En este trabajo se implementa una arquitectura \textit{event-driven} usando RabbitMQ como broker de mensajería (AMQP) y Docker para contenerizar cada servicio. 
El objetivo principal es comparar el comportamiento del sistema en tres escenarios de distribución: 
(1) centralizado, (2) distribuido en 2 nodos, y (3) distribuido en 3 nodos.

La solución se desarrolló de forma multilenguaje cumpliendo el requisito de utilizar al menos 3 lenguajes distintos. 
Se implementaron productores en Python y C++, y consumidores en Node.js y C++.

% ============================================================
\section{Descripción general del sistema}
\subsection{Servicios implementados (4 productores y 4 consumidores)}
\textbf{Productores:}
\begin{itemize}
    \item producer-alpha (Python) $\rightarrow$ \texttt{event.alpha}
    \item producer-beta (Python) $\rightarrow$ \texttt{event.beta}
    \item producer-gamma (Python) $\rightarrow$ \texttt{event.gamma}
    \item producer-delta (C++ con \texttt{rabbitmq-c}) $\rightarrow$ \texttt{event.delta}
\end{itemize}

\textbf{Consumidores:}
\begin{itemize}
    \item consumer-logger (Node.js) $\rightarrow$ recibe todos los eventos (en topic usa \texttt{event.*}, en direct usa bindings explícitos)
    \item consumer-audit (Node.js) $\rightarrow$ \texttt{event.alpha}, \texttt{event.beta}
    \item consumer-metrics (Node.js) $\rightarrow$ \texttt{event.gamma}
    \item consumer-delta (C++ con \texttt{rabbitmq-c}) $\rightarrow$ \texttt{event.delta}
\end{itemize}

\subsection{Estructura de eventos}
Los productores publican mensajes en formato JSON, incluyendo metadatos básicos del evento. Un ejemplo es:

\begin{lstlisting}[style=bashstyle]
{
  "producer": "producer-alpha",
  "type": "alpha",
  "id": "....",
  "ts": "2026-03-xxTxx:xx:xxZ",
  "payload": { "msg": "hello", "n": 123 }
}
\end{lstlisting}

\subsection{Exchanges por escenario}
\begin{itemize}
    \item \textbf{Scenario 1 (Centralizado):} Exchange \textbf{direct} (por ejemplo \texttt{events.direct})
    \item \textbf{Scenario 2 (2 nodos):} Exchange \textbf{topic} (por ejemplo \texttt{events.topic})
    \item \textbf{Scenario 3 (3 nodos):} Exchange \textbf{topic} (por ejemplo \texttt{events.topic})
\end{itemize}

% ============================================================
\section{Estructura del repositorio}
La solución se organizó para reutilizar los directorios \texttt{producers/}, \texttt{consumers/} y \texttt{cpp/} en la raíz del repositorio, y mantener los escenarios como directorios separados con sus archivos \texttt{docker-compose}.

\begin{figure}[H]
    \centering
    % Reemplazar por captura real de la estructura
    \includegraphics[width=0.5\textwidth]{Imagenes/estructura_repo.png}
    \caption{Estructura general del repositorio }
    \label{fig:estructura_repo}
\end{figure}

% ============================================================
\section{Explicación de los códigos}
\subsection{Código común de productores (Python)}
El archivo \texttt{common.py} centraliza la lógica de conexión y publicación para evitar duplicación. 
Incluye:
\begin{itemize}
    \item Lectura de variables de entorno (\texttt{RABBITMQ\_HOST}, puerto, usuario, \texttt{EXCHANGE}, \texttt{EXCHANGE\_TYPE}).
    \item Conexión AMQP con \texttt{pika}.
    \item Declaración del exchange (direct o topic según el escenario).
    \item Publicación continua de eventos JSON.
    \item Reintentos ante fallos de conexión.
\end{itemize}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.95\textwidth]{Imagenes/common.png}
    \caption{Código \texttt{common.py}}
    \label{fig:codigo_common}
\end{figure}

\subsection{Productores específicos (Python)}
Los archivos \texttt{producer\_alpha.py}, \texttt{producer\_beta.py} y \texttt{producer\_gamma.py} invocan a \texttt{publish\_loop} cambiando: nombre del productor, routing key, tipo de evento e intervalo.

\begin{figure}[H]
    \centering
    \includegraphics[width=0.90\textwidth]{Imagenes/alpha.png}
    \caption{Ejemplo productor específico \texttt{producer\_alpha.py} }
    \label{fig:codigo_producer_alpha}
\end{figure}

\subsection{Productor y consumidor en C++ (AMQP real con rabbitmq-c)}
Se implementó un productor y un consumidor en C++ utilizando la librería \texttt{rabbitmq-c}, cumpliendo:
\begin{itemize}
    \item Conexión TCP al broker.
    \item Autenticación AMQP.
    \item Declaración de exchange (direct o topic según el escenario).
    \item Publicación/consumo con \textit{ack} manual.
    \item Reintentos al fallar la conexión (importante porque RabbitMQ tarda algunos segundos en inicializar).
\end{itemize}

\begin{figure}[H]
    \centering
    % Captura sugerida: producer_delta.cpp
    \includegraphics[width=0.95\textwidth]{Imagenes/cpp_producer1.png}
    \caption{Productor C++ con rabbitmq-c }
    \label{fig:cpp_producer}
\end{figure}

\begin{figure}[H]
    \centering
    % Captura sugerida: producer_delta.cpp
    \includegraphics[width=0.95\textwidth]{Imagenes/cpp_producer2.png}
    \caption{Productor C++ con rabbitmq-c }
    \label{fig:cpp_producer}
\end{figure}

\begin{figure}[H]
    \centering
    % Captura sugerida: consumer_delta.cpp
    \includegraphics[width=0.95\textwidth]{Imagenes/cpp_consumer1.png}
    \caption{Consumidor C++ con rabbitmq-c }
    \label{fig:cpp_consumer}
\end{figure}

\begin{figure}[H]
    \centering
    % Captura sugerida: consumer_delta.cpp
    \includegraphics[width=0.95\textwidth]{Imagenes/cpp_consumer2.png}
    \caption{Consumidor C++ con rabbitmq-c }
    \label{fig:cpp_consumer}
\end{figure}

\subsection{Consumidores (Node.js)}
Los consumidores en Node.js usan \texttt{amqplib} y siguen el flujo:
\begin{enumerate}
    \item Conexión al broker RabbitMQ.
    \item Declaración del exchange (direct o topic).
    \item Declaración de cola durable.
    \item Bindings según routing keys requeridas.
    \item Consumo con \textit{ack} manual e impresión en consola.
\end{enumerate}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.90\textwidth]{Imagenes/consumerlogger.png}
    \caption{Ejemplo de \texttt{consumer\_logger.js} }
    \label{fig:codigo_consumer_logger}
\end{figure}

\subsection{Dockerfiles}
Se usaron tres Dockerfiles, uno por stack de lenguaje:
\begin{itemize}
    \item \texttt{producers/Dockerfile}: imagen Python e instalación de \texttt{pika}.
    \item \texttt{consumers/Dockerfile}: imagen Node.js e instalación de \texttt{amqplib}.
    \item \texttt{cpp/Dockerfile}: imagen Alpine, compilación con CMake e instalación de \texttt{rabbitmq-c-dev}.
\end{itemize}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{Imagenes/producerdockerfile.png}
    \caption{Dockerfile de productores Python }
    \label{fig:dockerfile_producers}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{Imagenes/consumerdockerfile.png}
    \caption{Dockerfile de consumidores Node.js }
    \label{fig:dockerfile_consumers}
\end{figure}

\begin{figure}[H]
    \centering
    % Captura sugerida: cpp/Dockerfile
    \includegraphics[width=0.85\textwidth]{Imagenes/cpp_dockerfile.png}
    \caption{Dockerfile del componente C++ con rabbitmq-c }
    \label{fig:dockerfile_cpp}
\end{figure}

% ============================================================
\section{Escenarios de despliegue}
\subsection{Scenario 1: Centralizado (Exchange Direct)}
En este escenario todos los contenedores (broker, productores y consumidores) se ejecutan en un mismo nodo. 
Se utiliza un exchange \textbf{direct}, por lo cual el enrutamiento depende de una coincidencia exacta de la routing key.

\textbf{Características:}
\begin{itemize}
    \item Simplicidad de despliegue.
    \item Menor complejidad de red.
    \item Útil para validar funcionamiento base.
\end{itemize}

\begin{figure}[H]
    \centering
    % Agregar diagrama/captura del compose del escenario 1
    \includegraphics[width=0.95\textwidth]{Imagenes/scenario1_compose1.png}
    \caption{Scenario 1: docker-compose centralizado con exchange direct }
    \label{fig:scenario1_compose}
\end{figure}

\begin{figure}[H]
    \centering
    % Agregar diagrama/captura del compose del escenario 1
    \includegraphics[width=0.95\textwidth]{Imagenes/scenario1_compose2.png}
    \caption{Scenario 1: docker-compose centralizado con exchange direct }
    \label{fig:scenario1_compose}
\end{figure}


\subsection{Scenario 2: Distribuido en 2 nodos (Exchange Topic)}
En este escenario el sistema se divide en dos nodos reales (dos VMs). 
\begin{itemize}
    \item \textbf{Nodo 1:} productores y consumidores.
    \item \textbf{Nodo 2:} RabbitMQ.
\end{itemize}

En este caso no se puede usar una red Docker compartida como \texttt{rabbitnet} entre VMs, ya que Docker networks no se extienden entre hosts. 
Por ello, los servicios del Nodo 1 se conectan al broker usando \texttt{RABBITMQ\_HOST=<IP\_del\_Nodo\_2>}.

\begin{figure}[H]
    \centering
    % Agregar evidencia de los compose node1/node2 del escenario 2
    \includegraphics[width=0.95\textwidth]{Imagenes/scenario2_compose_node1.png}
    \caption{Scenario 2: despliegue en 2 VMs con conexión por IP }
    \label{fig:scenario2_compose}
\end{figure}

\begin{figure}[H]
    \centering
    % Agregar evidencia de los compose node1/node2 del escenario 2
    \includegraphics[width=0.95\textwidth]{Imagenes/scenario2_compose_node2.png}
    \caption{Scenario 2: despliegue en 2 VMs con conexión por IP }
    \label{fig:scenario2_compose}
\end{figure}

\subsection{Scenario 3: Distribuido en 3 nodos (Exchange Topic)}
En este escenario se distribuyen los servicios en tres nodos reales (tres VMs):
\begin{itemize}
    \item \textbf{Nodo 1:} producer-alpha + consumer-logger + consumer-audit (ejemplo de partición).
    \item \textbf{Nodo 2:} producer-beta + producer-gamma + producer-delta(C++) + consumer-metrics + consumer-delta(C++).
    \item \textbf{Nodo 3:} RabbitMQ.
\end{itemize}

Al igual que en Scenario 2, los nodos de aplicación se conectan al broker mediante \texttt{RABBITMQ\_HOST=<IP\_Nodo\_3>}.

\begin{figure}[H]
    \centering
    % Agregar evidencia compose node1/node2/node3 del escenario 3
    \includegraphics[width=0.95\textwidth]{Imagenes/scenario3_compose_node1.png}
    \caption{Scenario 3: despliegue distribuido en 3 VMs con exchange topic}
    \label{fig:scenario3_compose}
\end{figure}
\begin{figure}[H]
    \centering
    % Agregar evidencia compose node1/node2/node3 del escenario 3
    \includegraphics[width=0.95\textwidth]{Imagenes/scenario3_compose_node2.png}
    \caption{Scenario 3: despliegue distribuido en 3 VMs con exchange topic}
    \label{fig:scenario3_compose}
\end{figure}
\begin{figure}[H]
    \centering
    % Agregar evidencia compose node1/node2/node3 del escenario 3
    \includegraphics[width=0.95\textwidth]{Imagenes/scenario3_compose_node3.png}
    \caption{Scenario 3: despliegue distribuido en 3 VMs con exchange topic}
    \label{fig:scenario3_compose}
\end{figure}

% ============================================================
\section{Orden de ejecución y comandos por escenario}

\subsection{Scenario 1 (centralizado)}
\begin{lstlisting}[style=bashstyle]
cd scenario1-centralized-direct
docker compose up --build
\end{lstlisting}

\subsection{Scenario 2 (2 nodos reales / 2 VMs)}
\textbf{Nodo 2 (Broker):}
\begin{lstlisting}[style=bashstyle]
cd scenario2-2nodes-topic
docker compose -f node2.compose.yml up -d
\end{lstlisting}

\textbf{Nodo 1 (Apps):} (conectar a la IP del broker)
\begin{lstlisting}[style=bashstyle]
cd scenario2-2nodes-topic
sudo docker compose -f node1.compose.yml up --build
\end{lstlisting}

\subsection{Scenario 3 (3 nodos reales / 3 VMs)}
\textbf{Nodo 3 (Broker):}
\begin{lstlisting}[style=bashstyle]
cd scenario3-3nodes-topic
docker compose -f node3.compose.yml up -d
\end{lstlisting}

\textbf{Nodo 1 (Apps):}
\begin{lstlisting}[style=bashstyle]
cd scenario3-3nodes-topic
sudo docker compose -f node1.compose.yml up --build
\end{lstlisting}

\textbf{Nodo 2 (Apps):}
\begin{lstlisting}[style=bashstyle]
cd scenario3-3nodes-topic
sudo docker compose -f node2.compose.yml up --build
\end{lstlisting}

\subsection{Detener servicios}
\begin{lstlisting}[style=bashstyle]
# Scenario 1
cd scenario1-centralized-direct
docker compose down

# Scenario 2 (en cada VM)
cd scenario2-2nodes-topic
sudo docker compose -f node1.compose.yml down
docker compose -f node2.compose.yml down

# Scenario 3 (en cada VM)
cd scenario3-3nodes-topic
sudo docker compose -f node1.compose.yml down
sudo docker compose -f node2.compose.yml down
docker compose -f node3.compose.yml down
\end{lstlisting}

% ============================================================
\section{Resultados obtenidos (evidencias)}
\subsection{Evidencia de consola}
En las consolas de ejecución se evidencia:
\begin{itemize}
    \item Publicación continua de eventos por los 4 productores.
    \item Consumo selectivo por bindings en los 4 consumidores.
    \item Correcto enrutamiento en topic (Scenario 2 y 3) y coincidencia exacta en direct (Scenario 1).
\end{itemize}

\begin{figure}[H]
    \centering
    % Colocar screenshot del escenario 1 corriendo
    \includegraphics[width=0.98\textwidth]{Imagenes/scenario1_terminal1.png}
    \caption{Ejecución Scenario 1 }
    \label{fig:scenario1_terminal}
\end{figure}
\begin{figure}[H]
    \centering
    % Colocar screenshot del escenario 1 corriendo
    \includegraphics[width=0.98\textwidth]{Imagenes/scenario1_terminal2.png}
    \caption{Ejecución Scenario 1 }
    \label{fig:scenario1_terminal}
\end{figure}

\begin{figure}[H]
    \centering
    % Colocar screenshot del escenario 2 corriendo
    \includegraphics[width=0.98\textwidth]{Imagenes/scenario2_terminal1.png}
    \caption{Ejecución Scenario 2 }
    \label{fig:scenario2_terminal}
\end{figure}
\begin{figure}[H]
    \centering
    % Colocar screenshot del escenario 2 corriendo
    \includegraphics[width=0.98\textwidth]{Imagenes/scenario2_terminal2.png}
    \caption{Ejecución Scenario 2 }
    \label{fig:scenario2_terminal}
\end{figure}

\begin{figure}[H]
    \centering
    % Colocar screenshot del escenario 3 corriendo
    \includegraphics[width=0.98\textwidth]{Imagenes/scenario3_terminal1.png}
    \caption{Ejecución Scenario 3 }
    \label{fig:scenario3_terminal}
\end{figure}
\begin{figure}[H]
    \centering
    % Colocar screenshot del escenario 3 corriendo
    \includegraphics[width=0.98\textwidth]{Imagenes/scenario3_terminal2.png}
    \caption{Ejecución Scenario 3 }
    \label{fig:scenario3_terminal}
\end{figure}
\begin{figure}[H]
    \centering
    % Colocar screenshot del escenario 3 corriendo
    \includegraphics[width=0.98\textwidth]{Imagenes/scenario3_terminal3.png}
    \caption{Ejecución Scenario 3 }
    \label{fig:scenario3_terminal}
\end{figure}

\subsection{Interfaz RabbitMQ (Management UI)}
En la interfaz \textit{RabbitMQ Management} se verificó:
\begin{itemize}
    \item Exchanges creados (direct/topic según escenario).
    \item Colas durables por consumidor.
    \item Bindings correctos (\texttt{event.*} para logger en topic; bindings explícitos en direct).
    \item Conexiones activas desde múltiples nodos.
\end{itemize}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.98\textwidth]{Imagenes/rabbit_overview.png}
    \caption{RabbitMQ Overview }
    \label{fig:rabbit_overview}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.98\textwidth]{Imagenes/rabbit_connections.png}
    \caption{RabbitMQ Connections }
    \label{fig:rabbit_connections}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.98\textwidth]{Imagenes/rabbit_exchanges.png}
    \caption{RabbitMQ Exchanges (}
    \label{fig:rabbit_exchanges}
\end{figure}
\begin{figure}[H]
    \centering
    \includegraphics[width=0.98\textwidth]{Imagenes/rabbit_exchanges2.png}
    \caption{RabbitMQ Exchanges (}
    \label{fig:rabbit_exchanges}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.98\textwidth]{Imagenes/rabbit_queues.png}
    \caption{RabbitMQ Queues }
    \label{fig:rabbit_queues}
\end{figure}

% ============================================================
\section{Análisis comparativo entre escenarios}
\subsection{Scenario 1 (Centralizado)}
\begin{itemize}
    \item Ventajas: simple, menos problemas de conectividad, ideal para pruebas iniciales.
    \item Desventajas: no representa un sistema distribuido real; un fallo del nodo afecta a todos los servicios.
\end{itemize}

\subsection{Scenario 2 (2 nodos)}
\begin{itemize}
    \item Ventajas: separación broker/aplicaciones; permite observar latencia y dependencia de red.
    \item Desventajas: requiere configuración de IP/puertos; depende de conectividad entre VMs.
\end{itemize}

\subsection{Scenario 3 (3 nodos)}
\begin{itemize}
    \item Ventajas: mayor realismo de arquitectura distribuida; permite particionar carga y servicios por nodos.
    \item Desventajas: mayor complejidad operativa; diagnóstico de fallos distribuido.
\end{itemize}


\end{document}